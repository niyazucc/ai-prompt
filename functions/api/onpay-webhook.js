const MAX_BODY_BYTES = 64 * 1024;
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

const EMAIL_FIELDS = ['email', 'buyer_email', 'buyerEmail', 'payer_email', 'customer_email', 'email_pembeli'];
const STATUS_FIELDS = ['status', 'payment_status', 'paymentStatus', 'transaction_status', 'status_bayaran'];
const REFERENCE_FIELDS = ['reference', 'ref', 'order_id', 'orderId', 'invoice_no', 'transaction_id', 'trans_id'];

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function flatten(input, output = {}) {
  if (!input || typeof input !== 'object') return output;
  for (const [key, value] of Object.entries(input)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, output);
    else if (value !== undefined && value !== null) output[key] = String(value).trim();
  }
  return output;
}

function firstValue(payload, fields) {
  for (const field of fields) {
    if (payload[field]) return payload[field];
  }
  return '';
}

function base64Url(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function secureEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(right)),
  ]);
  return crypto.subtle.timingSafeEqual(leftHash, rightHash);
}

function pemToArrayBuffer(pem) {
  const normalized = pem.replace(/\\n/g, '\n');
  const base64 = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsignedToken = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.FIREBASE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken),
  );

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedToken}.${base64Url(signature)}`,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error(`Google OAuth failed (${response.status})`);
  return result.access_token;
}

async function parsePayload(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    return flatten(Object.fromEntries(await request.formData()));
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  if (contentType.includes('application/json')) return flatten(JSON.parse(body));
  return flatten(Object.fromEntries(new URLSearchParams(body)));
}

async function findUserDocument(projectId, accessToken, email) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: email },
          },
        },
        limit: 2,
      },
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Firestore query failed (${response.status})`);
  const documents = result.map((entry) => entry.document).filter(Boolean);
  if (documents.length > 1) throw new Error('Multiple Firebase profiles use the same email');
  return documents[0] || null;
}

function safeDocumentId(reference) {
  const cleaned = reference.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || crypto.randomUUID();
}

async function activateUser(env, accessToken, userDocument, payload, email) {
  const projectPath = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const now = new Date().toISOString();
  const reference = firstValue(payload, REFERENCE_FIELDS);
  const paymentDocument = `${projectPath}/onpayPayments/${safeDocumentId(reference)}`;
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents:commit`;

  const response = await fetch(commitUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: userDocument.name,
            fields: {
              email: { stringValue: email },
              hasPaid: { booleanValue: true },
              paidAt: { timestampValue: now },
              paymentProvider: { stringValue: 'onpay' },
            },
          },
          updateMask: { fieldPaths: ['email', 'hasPaid', 'paidAt', 'paymentProvider'] },
          currentDocument: { exists: true },
        },
        {
          update: {
            name: paymentDocument,
            fields: {
              email: { stringValue: email },
              reference: { stringValue: reference || paymentDocument.split('/').pop() },
              status: { stringValue: firstValue(payload, STATUS_FIELDS) || 'jualan_disahkan' },
              receivedAt: { timestampValue: now },
              provider: { stringValue: 'onpay' },
            },
          },
          updateMask: { fieldPaths: ['email', 'reference', 'status', 'receivedAt', 'provider'] },
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Firestore commit failed (${response.status})`);
}

export async function onRequest(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  if (request.method === 'GET') {
    return json({ ok: true, provider: 'onpay', configured: Boolean(env.ONPAY_WEBHOOK_SECRET) });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405, headers: { allow: 'GET, POST' } });

  try {
    const suppliedSecret = new URL(request.url).searchParams.get('token') || request.headers.get('x-onpay-webhook-secret') || '';
    if (!env.ONPAY_WEBHOOK_SECRET || !suppliedSecret || !(await secureEqual(suppliedSecret, env.ONPAY_WEBHOOK_SECRET))) {
      console.warn(JSON.stringify({ event: 'onpay_webhook_rejected', requestId }));
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requiredBindings = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
    if (requiredBindings.some((key) => !env[key])) throw new Error('Firebase service account bindings are incomplete');

    const payload = await parsePayload(request);
    const email = firstValue(payload, EMAIL_FIELDS).toLowerCase();
    const status = firstValue(payload, STATUS_FIELDS).toLowerCase();
    if (!email || !email.includes('@')) return json({ error: 'A valid customer email is required' }, { status: 400 });

    // This endpoint is configured for OnPay's "Jualan Disahkan" activity. If OnPay
    // also sends an explicit status, only known successful values are accepted.
    if (status && !SUCCESS_STATUSES.has(status)) {
      console.info(JSON.stringify({ event: 'onpay_payment_ignored', requestId, status }));
      return json({ ok: true, activated: false, reason: 'payment_not_confirmed' });
    }

    const accessToken = await getGoogleAccessToken(env);
    const userDocument = await findUserDocument(env.FIREBASE_PROJECT_ID, accessToken, email);
    if (!userDocument) {
      console.warn(JSON.stringify({ event: 'onpay_user_not_found', requestId, email }));
      return json({ error: 'No registered account matches this payment email' }, { status: 404 });
    }

    await activateUser(env, accessToken, userDocument, payload, email);
    console.info(JSON.stringify({ event: 'onpay_access_activated', requestId, email }));
    return json({ ok: true, activated: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'PAYLOAD_TOO_LARGE' ? 413 : 500;
    console.error(JSON.stringify({ event: 'onpay_webhook_error', requestId, message }));
    return json({ error: status === 413 ? 'Payload too large' : 'Webhook processing failed', requestId }, { status });
  }
}
