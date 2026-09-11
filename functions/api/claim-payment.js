import {
  firestoreRequest,
  getGoogleAccessToken,
  isFirestorePreconditionFailure,
  json,
  projectDocumentsPath,
  sha256Hex,
  verifyFirebaseIdToken,
} from '../_lib/firebase-rest.js';

const MAX_CLAIM_ATTEMPTS = 3;

function stringField(document, field) {
  return document.fields?.[field]?.stringValue || '';
}

export async function claimPendingPayment(env, accessToken, firebaseUser, { allowUserCreate = false } = {}) {
  const email = firebaseUser.email.trim().toLowerCase();
  const pendingId = await sha256Hex(email);
  const documentsPath = projectDocumentsPath(env);

  for (let attempt = 0; attempt < MAX_CLAIM_ATTEMPTS; attempt += 1) {
    const pendingResponse = await firestoreRequest(
      env,
      accessToken,
      `documents/pendingOnpayCustomers/${pendingId}`,
      { method: 'GET' },
    );
    if (pendingResponse.status === 404) return { claimed: false, reason: 'no_matching_payment' };
    if (!pendingResponse.ok) throw new Error(`Pending payment lookup failed (${pendingResponse.status})`);

    const pending = await pendingResponse.json();
    if (!pending.updateTime || stringField(pending, 'email').toLowerCase() !== email || pending.fields?.hasPaid?.booleanValue !== true) {
      throw new Error('Pending payment record is invalid');
    }

    const reference = stringField(pending, 'reference');
    if (!reference) throw new Error('Pending payment reference is missing');
    const paymentId = await sha256Hex(reference);
    const paymentResponse = await firestoreRequest(env, accessToken, `documents/onpayPayments/${paymentId}`, { method: 'GET' });
    if (!paymentResponse.ok) throw new Error(`Payment lookup failed (${paymentResponse.status})`);
    const payment = await paymentResponse.json();
    if (
      !payment.updateTime
      || stringField(payment, 'email').toLowerCase() !== email
      || stringField(payment, 'reference') !== reference
      || stringField(payment, 'claimStatus') !== 'pending_registration'
    ) {
      throw new Error('Payment record is invalid or already claimed');
    }

    const claimedAt = new Date().toISOString();
    const userFields = {
      email: { stringValue: email },
      hasPaid: { booleanValue: true },
      paidAt: { timestampValue: claimedAt },
      paymentProvider: { stringValue: 'onpay' },
      paymentReference: { stringValue: reference },
      onpayName: { stringValue: stringField(pending, 'name') },
      phone: { stringValue: stringField(pending, 'phone') },
    };
    const userFieldPaths = ['email', 'hasPaid', 'paidAt', 'paymentProvider', 'paymentReference', 'onpayName', 'phone'];
    if (allowUserCreate) {
      userFields.name = { stringValue: firebaseUser.displayName || stringField(pending, 'name') };
      userFieldPaths.push('name');
    }
    const userWrite = {
      update: {
        name: `${documentsPath}/users/${firebaseUser.localId}`,
        fields: userFields,
      },
      updateMask: { fieldPaths: userFieldPaths },
    };
    if (!allowUserCreate) userWrite.currentDocument = { exists: true };

    const commitResponse = await firestoreRequest(env, accessToken, 'documents:commit', {
      method: 'POST',
      body: JSON.stringify({
        writes: [
          userWrite,
          {
            update: {
              name: payment.name,
              fields: {
                claimStatus: { stringValue: 'claimed' },
                claimedAt: { timestampValue: claimedAt },
                claimedUid: { stringValue: firebaseUser.localId },
              },
            },
            updateMask: { fieldPaths: ['claimStatus', 'claimedAt', 'claimedUid'] },
            currentDocument: { updateTime: payment.updateTime },
          },
          {
            delete: pending.name,
            currentDocument: { updateTime: pending.updateTime },
          },
        ],
      }),
    });
    if (commitResponse.ok) return { claimed: true };
    if (attempt < MAX_CLAIM_ATTEMPTS - 1 && await isFirestorePreconditionFailure(commitResponse)) continue;
    throw new Error(`Payment claim failed (${commitResponse.status})`);
  }

  throw new Error('Payment claim retries exhausted');
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

    const accessToken = await getGoogleAccessToken(env);
    const result = await claimPendingPayment(env, accessToken, firebaseUser);

    if (result.claimed) {
      console.info(JSON.stringify({ event: 'onpay_payment_claimed', requestId, uid: firebaseUser.localId }));
    }
    return json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(JSON.stringify({ event: 'onpay_claim_error', requestId, message }));
    return json({ error: 'Payment claim failed', requestId }, { status: 500 });
  }
}
