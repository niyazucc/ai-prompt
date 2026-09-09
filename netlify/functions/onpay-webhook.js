import { timingSafeEqual } from 'node:crypto';

import { FieldValue } from 'firebase-admin/firestore';

import { getFirebaseAdmin } from '../lib/firebase-admin.js';

const SUCCESS_STATUSES = new Set([
  '1',
  'confirmed',
  'disahkan',
  'paid',
  'payment_success',
  'sale_confirmed',
  'success',
  'successful',
  'jualan_disahkan',
]);

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function decodeBody(event) {
  const body = event.body || '';
  return event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
}

function parseBody(event) {
  const rawBody = decodeBody(event);
  const contentType = event.headers?.['content-type'] ?? event.headers?.['Content-Type'] ?? '';

  if (contentType.includes('application/json')) {
    return JSON.parse(rawBody || '{}');
  }

  return Object.fromEntries(new URLSearchParams(rawBody));
}

function flattenPayload(value, prefix = '', output = {}) {
  if (value === null || value === undefined) return output;

  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenPayload(item, `${prefix}_${index}`, output));
    return output;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      const nextKey = prefix ? `${prefix}_${key}` : key;
      flattenPayload(item, nextKey, output);
    });
    return output;
  }

  output[prefix.toLowerCase().replace(/[^a-z0-9]+/g, '_')] = String(value).trim();
  return output;
}

function firstValue(payload, exactKeys, keyFragments = []) {
  for (const key of exactKeys) {
    if (payload[key]) return payload[key];
  }

  const match = Object.entries(payload).find(([key, value]) => (
    value && keyFragments.some((fragment) => key.includes(fragment))
  ));
  return match?.[1] ?? '';
}

function normalizeStatus(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function isAuthorized(event) {
  const expectedSecret = requireEnv('ONPAY_WEBHOOK_SECRET');
  const suppliedSecret = event.queryStringParameters?.token
    ?? event.headers?.['x-onpay-webhook-secret']
    ?? event.headers?.['X-Onpay-Webhook-Secret']
    ?? '';

  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function paymentReference(payload) {
  return firstValue(
    payload,
    ['invoice', 'invoice_no', 'invoice_number', 'no_invoice', 'order_id', 'sale_id', 'jualan_id', 'id'],
    ['invoice', 'invois', 'order_id', 'sale_id', 'jualan_id'],
  );
}

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    try {
      if (!isAuthorized(event)) return response(401, { error: 'Unauthorized' });
      return response(200, { message: 'OnPay webhook is ready' });
    } catch (error) {
      console.error('OnPay webhook health check failed:', error);
      return response(500, { error: 'Webhook is not configured' });
    }
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method Not Allowed' }, { Allow: 'GET, POST' });
  }

  try {
    if (!isAuthorized(event)) {
      console.error('OnPay webhook rejected: invalid secret token.');
      return response(401, { error: 'Unauthorized' });
    }

    const rawPayload = parseBody(event);
    const payload = flattenPayload(rawPayload);
    const email = firstValue(
      payload,
      ['email', 'emel', 'customer_email', 'buyer_email', 'pelanggan_email', 'customer_emel'],
      ['email', 'emel'],
    ).trim().toLowerCase();
    const rawStatus = firstValue(
      payload,
      ['status', 'sale_status', 'payment_status', 'order_status', 'status_jualan', 'activity', 'aktiviti', 'event'],
      ['status', 'activity', 'aktiviti', 'event'],
    );
    const status = normalizeStatus(rawStatus);

    // OnPay lets the merchant configure this URL for a selected Activity. Configure
    // it for "Jualan Disahkan" only. Some OnPay payloads do not repeat the activity
    // name, so a missing status is accepted; an explicit non-success status is ignored.
    if (status && !SUCCESS_STATUSES.has(status)) {
      console.info('OnPay webhook ignored for non-success status:', status);
      return response(200, { message: 'Ignored non-success OnPay activity' });
    }

    if (!email) {
      console.error('OnPay webhook has no recognizable email field. Fields:', Object.keys(payload));
      return response(200, { message: 'Webhook received, but customer email was not found' });
    }

    const { auth, db } = getFirebaseAdmin();
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        console.error('OnPay payment email does not match a Firebase user:', email);
        await db.collection('onpayPayments').add({
          email,
          matched: false,
          reference: paymentReference(payload),
          rawStatus,
          receivedAt: FieldValue.serverTimestamp(),
        });
        return response(200, { message: 'Payment received, but no matching account was found' });
      }
      throw error;
    }

    const userRef = db.collection('users').doc(firebaseUser.uid);
    const reference = paymentReference(payload);
    const paymentRef = reference
      ? db.collection('onpayPayments').doc(reference.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 200))
      : db.collection('onpayPayments').doc();

    await db.runTransaction(async (transaction) => {
      transaction.set(userRef, {
        email,
        hasPaid: true,
        paidAt: FieldValue.serverTimestamp(),
        paymentProvider: 'onpay',
      }, { merge: true });

      transaction.set(paymentRef, {
        email,
        userId: firebaseUser.uid,
        matched: true,
        reference,
        rawStatus,
        status: 'paid',
        receivedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    console.info('OnPay payment activated Firebase user:', firebaseUser.uid);
    return response(200, { message: 'OK' });
  } catch (error) {
    console.error('OnPay webhook failed:', error);
    return response(500, { error: 'Webhook processing failed' });
  }
}
