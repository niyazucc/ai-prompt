import {
  firestoreRequest,
  getGoogleAccessToken,
  isFirestorePreconditionFailure,
  json,
  projectDocumentsPath,
  secureEqual,
  sha256Hex,
} from '../_lib/firebase-rest.js';
import { ensureFirebaseUser, sendPasswordSetupEmail } from '../_lib/firebase-auth.js';
import { extractOnpayCustomer, extractOnpayPassword, isSuccessfulOnpayWebhook } from '../_lib/onpay.js';
import { claimPendingPayment } from './claim-payment.js';

const MAX_BODY_BYTES = 64 * 1024;
const MAX_WRITE_ATTEMPTS = 3;

function stringField(document, field) {
  return document.fields?.[field]?.stringValue || '';
}

function flatten(input, output = {}) {
  if (!input || typeof input !== 'object') return output;
  for (const [key, value] of Object.entries(input)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, output);
    else if (value !== undefined && value !== null) output[key] = String(value).trim();
  }
  return output;
}

export async function parsePayload(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) return flatten(Object.fromEntries(await request.formData()));
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  if (contentType.includes('application/json')) return flatten(JSON.parse(body));
  return flatten(Object.fromEntries(new URLSearchParams(body)));
}

export async function storePaidCustomer(env, accessToken, payload) {
  const { email, name, phone, reference, status: suppliedStatus } = extractOnpayCustomer(payload);
  const status = suppliedStatus || 'jualan_disahkan';
  const documentsPath = projectDocumentsPath(env);
  const pendingId = await sha256Hex(email);
  const paymentId = await sha256Hex(reference);
  const paymentName = `${documentsPath}/onpayPayments/${paymentId}`;

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const paymentResponse = await firestoreRequest(env, accessToken, `documents/onpayPayments/${paymentId}`, { method: 'GET' });
    let paymentPrecondition = { exists: false };
    if (paymentResponse.ok) {
      const payment = await paymentResponse.json();
      if (stringField(payment, 'email').toLowerCase() !== email || stringField(payment, 'reference') !== reference) {
        throw new Error('Payment reference conflicts with an existing transaction');
      }
      if (stringField(payment, 'claimStatus') === 'claimed') return { alreadyClaimed: true };
      paymentPrecondition = { updateTime: payment.updateTime };
    } else if (paymentResponse.status !== 404) {
      throw new Error(`Payment lookup failed (${paymentResponse.status})`);
    }

    const receivedAt = new Date().toISOString();
    const response = await firestoreRequest(env, accessToken, 'documents:commit', {
      method: 'POST',
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: `${documentsPath}/pendingOnpayCustomers/${pendingId}`,
              fields: {
                email: { stringValue: email },
                name: { stringValue: name },
                phone: { stringValue: phone },
                hasPaid: { booleanValue: true },
                reference: { stringValue: reference },
                status: { stringValue: status },
                provider: { stringValue: 'onpay' },
                receivedAt: { timestampValue: receivedAt },
              },
            },
            updateMask: { fieldPaths: ['email', 'name', 'phone', 'hasPaid', 'reference', 'status', 'provider', 'receivedAt'] },
          },
          {
            update: {
              name: paymentName,
              fields: {
                email: { stringValue: email },
                reference: { stringValue: reference },
                status: { stringValue: status },
                receivedAt: { timestampValue: receivedAt },
                provider: { stringValue: 'onpay' },
                claimStatus: { stringValue: 'pending_registration' },
              },
            },
            updateMask: { fieldPaths: ['email', 'reference', 'status', 'receivedAt', 'provider', 'claimStatus'] },
            currentDocument: paymentPrecondition,
          },
        ],
      }),
    });
    if (response.ok) return { alreadyClaimed: false };
    if (attempt < MAX_WRITE_ATTEMPTS - 1 && await isFirestorePreconditionFailure(response)) continue;
    throw new Error(`Firestore commit failed (${response.status})`);
  }

  throw new Error('Firestore commit retries exhausted');
}

export async function registerPaidCustomer(env, accessToken, payload) {
  const password = extractOnpayPassword(payload, env.ONPAY_PASSWORD_FIELD);
  if (password.length < 6) throw new Error('OnPay password is missing or shorter than 6 characters');

  const { alreadyClaimed } = await storePaidCustomer(env, accessToken, payload);
  if (alreadyClaimed) return { alreadyClaimed: true };

  const customer = extractOnpayCustomer(payload);
  const firebaseUser = await ensureFirebaseUser(env, accessToken, { ...customer, password });
  const passwordSetupEmailSent = !firebaseUser.created;
  if (passwordSetupEmailSent) await sendPasswordSetupEmail(env, customer.email);
  const claim = await claimPendingPayment(env, accessToken, {
    localId: firebaseUser.localId,
    email: customer.email,
    displayName: customer.name,
  }, { allowUserCreate: true });
  if (!claim.claimed) throw new Error(`Automatic payment claim failed (${claim.reason || 'unknown'})`);
  return { alreadyClaimed: false, firebaseUser, passwordSetupEmailSent };
}

export async function onRequest(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();
  if (request.method === 'GET') return json({ ok: true, provider: 'onpay', configured: Boolean(env.ONPAY_WEBHOOK_SECRET) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405, headers: { allow: 'GET, POST' } });

  try {
    const payload = await parsePayload(request);
    const suppliedSecret = payload.token
      || request.headers.get('x-onpay-webhook-secret')
      || new URL(request.url).searchParams.get('token')
      || '';
    if (!env.ONPAY_WEBHOOK_SECRET || !suppliedSecret || !(await secureEqual(suppliedSecret, env.ONPAY_WEBHOOK_SECRET))) {
      console.warn(JSON.stringify({ event: 'onpay_webhook_rejected', requestId }));
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const requiredBindings = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_WEB_API_KEY'];
    if (requiredBindings.some((key) => !env[key])) throw new Error('Firebase service account bindings are incomplete');

    const { email, reference, status } = extractOnpayCustomer(payload);
    if (!email || !email.includes('@')) return json({ error: 'A valid customer email is required' }, { status: 400 });
    if (!reference) return json({ error: 'A payment reference is required' }, { status: 400 });
    if (!isSuccessfulOnpayWebhook(payload, status)) {
      console.info(JSON.stringify({ event: 'onpay_payment_ignored', requestId, eventType: payload.event_type || '', status }));
      return json({ ok: true, recorded: false, reason: 'payment_not_confirmed' });
    }

    const accessToken = await getGoogleAccessToken(env);
    const { alreadyClaimed, firebaseUser, passwordSetupEmailSent } = await registerPaidCustomer(env, accessToken, payload);
    if (alreadyClaimed) {
      console.info(JSON.stringify({ event: 'onpay_payment_already_claimed', requestId }));
      return json({ ok: true, recorded: true, registered: true, alreadyClaimed: true });
    }

    console.info(JSON.stringify({
      event: 'onpay_paid_user_registered',
      requestId,
      uid: firebaseUser.localId,
      accountCreated: firebaseUser.created,
    }));
    return json({ ok: true, recorded: true, registered: true, passwordSetupEmailSent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'PAYLOAD_TOO_LARGE' ? 413 : 500;
    console.error(JSON.stringify({ event: 'onpay_webhook_error', requestId, message }));
    return json({ error: status === 413 ? 'Payload too large' : 'Webhook processing failed', requestId }, { status });
  }
}
