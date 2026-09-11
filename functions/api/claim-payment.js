import {
  firestoreRequest,
  getGoogleAccessToken,
  json,
  projectDocumentsPath,
  safeDocumentId,
  sha256Hex,
  verifyFirebaseIdToken,
} from '../_lib/firebase-rest.js';

function stringField(document, field) {
  return document.fields?.[field]?.stringValue || '';
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  try {
    const requiredBindings = [
      'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_WEB_API_KEY',
    ];
    if (requiredBindings.some((key) => !env[key])) throw new Error('Firebase bindings are incomplete');

    const authorization = request.headers.get('authorization') || '';
    const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!idToken || idToken.length > 10_000) return json({ error: 'Unauthorized' }, { status: 401 });

    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseIdToken(env, idToken);
    } catch {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (firebaseUser.emailVerified !== true) {
      return json({ claimed: false, reason: 'email_not_verified' }, { status: 403 });
    }

    const email = firebaseUser.email.trim().toLowerCase();
    const pendingId = await sha256Hex(email);
    const accessToken = await getGoogleAccessToken(env);
    const pendingResponse = await firestoreRequest(
      env,
      accessToken,
      `documents/pendingOnpayCustomers/${pendingId}`,
      { method: 'GET' },
    );
    if (pendingResponse.status === 404) return json({ claimed: false, reason: 'no_matching_payment' });
    if (!pendingResponse.ok) throw new Error(`Pending payment lookup failed (${pendingResponse.status})`);

    const pending = await pendingResponse.json();
    if (stringField(pending, 'email').toLowerCase() !== email || pending.fields?.hasPaid?.booleanValue !== true) {
      throw new Error('Pending payment record is invalid');
    }

    const documentsPath = projectDocumentsPath(env);
    const reference = stringField(pending, 'reference');
    const paymentId = safeDocumentId(reference);
    const claimedAt = new Date().toISOString();
    const commitResponse = await firestoreRequest(env, accessToken, 'documents:commit', {
      method: 'POST',
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: `${documentsPath}/users/${firebaseUser.localId}`,
              fields: {
                email: { stringValue: email },
                hasPaid: { booleanValue: true },
                paidAt: { timestampValue: claimedAt },
                paymentProvider: { stringValue: 'onpay' },
                paymentReference: { stringValue: reference },
                onpayName: { stringValue: stringField(pending, 'name') },
                phone: { stringValue: stringField(pending, 'phone') },
              },
            },
            updateMask: {
              fieldPaths: ['email', 'hasPaid', 'paidAt', 'paymentProvider', 'paymentReference', 'onpayName', 'phone'],
            },
            currentDocument: { exists: true },
          },
          {
            update: {
              name: `${documentsPath}/onpayPayments/${paymentId}`,
              fields: {
                claimStatus: { stringValue: 'claimed' },
                claimedAt: { timestampValue: claimedAt },
                claimedUid: { stringValue: firebaseUser.localId },
              },
            },
            updateMask: { fieldPaths: ['claimStatus', 'claimedAt', 'claimedUid'] },
          },
          {
            delete: pending.name,
            currentDocument: { exists: true },
          },
        ],
      }),
    });
    if (!commitResponse.ok) throw new Error(`Payment claim failed (${commitResponse.status})`);

    console.info(JSON.stringify({ event: 'onpay_payment_claimed', requestId, uid: firebaseUser.localId }));
    return json({ claimed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(JSON.stringify({ event: 'onpay_claim_error', requestId, message }));
    return json({ error: 'Payment claim failed', requestId }, { status: 500 });
  }
}
