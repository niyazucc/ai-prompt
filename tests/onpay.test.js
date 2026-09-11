import assert from 'node:assert/strict';
import test from 'node:test';

import { sha256Hex } from '../functions/_lib/firebase-rest.js';
import { extractOnpayCustomer, isSuccessfulOnpayStatus, isSuccessfulOnpayWebhook } from '../functions/_lib/onpay.js';
import { claimPendingPayment } from '../functions/api/claim-payment.js';
import { parsePayload, storePaidCustomer } from '../functions/api/onpay-webhook.js';

const projectId = 'onpay-test';
const documentsPath = `projects/${projectId}/databases/(default)/documents`;
const env = { FIREBASE_PROJECT_ID: projectId };

class FirestoreMock {
  constructor() {
    this.documents = new Map();
    this.revision = 0;
    this.afterPendingRead = null;
  }

  put(name, fields) {
    this.revision += 1;
    this.documents.set(name, {
      name,
      fields,
      updateTime: new Date(Date.UTC(2026, 0, 1, 0, 0, 0, this.revision)).toISOString(),
    });
  }

  response(body, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  async fetch(url, init = {}) {
    const endpoint = url.split('/databases/(default)/')[1];
    if (endpoint === 'documents:commit') return this.commit(JSON.parse(init.body));

    const name = `projects/${projectId}/databases/(default)/${endpoint}`;
    const document = this.documents.get(name);
    const snapshot = document ? structuredClone(document) : null;
    if (endpoint.startsWith('documents/pendingOnpayCustomers/') && this.afterPendingRead) {
      const callback = this.afterPendingRead;
      this.afterPendingRead = null;
      await callback();
    }
    return snapshot ? this.response(snapshot) : this.response({}, 404);
  }

  commit({ writes }) {
    for (const write of writes) {
      const name = write.delete || write.update.name;
      const document = this.documents.get(name);
      const precondition = write.currentDocument;
      if (
        (precondition?.exists === true && !document)
        || (precondition?.exists === false && document)
        || (precondition?.updateTime && precondition.updateTime !== document?.updateTime)
      ) {
        return this.response({ error: { status: 'FAILED_PRECONDITION' } }, 400);
      }
    }

    for (const write of writes) {
      if (write.delete) {
        this.documents.delete(write.delete);
      } else {
        const existingFields = this.documents.get(write.update.name)?.fields || {};
        this.put(write.update.name, { ...existingFields, ...write.update.fields });
      }
    }
    return this.response({ writeResults: [] });
  }
}

function paidPayload(reference) {
  return {
    client_email: 'buyer@example.com',
    client_fullname: 'Buyer Name',
    client_phone_number: '0123456789',
    sale_id: reference,
    status: 'paid',
  };
}

function firebaseUser(localId) {
  return { localId, email: 'buyer@example.com', emailVerified: true };
}

test('extracts the fields used by the Promptly OnPay form', () => {
  assert.deepEqual(extractOnpayCustomer({
    client_fullname: '  Nur Aisyah  ',
    client_email: '  Aisyah@Example.COM ',
    client_phone_dial_code: '60',
    client_phone_number: '012-345 6789',
    sale_id: 'SALE-42',
    status: 'SUCCESS',
  }), {
    email: 'aisyah@example.com',
    name: 'Nur Aisyah',
    phone: '+60123456789',
    reference: 'SALE-42',
    status: 'success',
  });
});

test('accepts a missing status only for a success-only OnPay callback', () => {
  assert.equal(isSuccessfulOnpayStatus(''), true);
  assert.equal(isSuccessfulOnpayStatus('jualan_disahkan'), true);
  assert.equal(isSuccessfulOnpayStatus('pending'), false);
  assert.equal(isSuccessfulOnpayStatus('failed'), false);
});

test('accepts OnPay sale.confirmed JSON and uses the sale uid as its reference', async () => {
  const request = new Request('https://example.com/api/onpay-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      token: 'onpay-webhook-token',
      event_type: 'sale.confirmed',
      sale: {
        id: 5,
        uid: '156xEnQ2OJ',
        client_fullname: 'Niyaz',
        client_email: 'yoonjae9211@gmail.com',
        status: 0,
      },
    }),
  });
  const payload = await parsePayload(request);

  assert.equal(payload.token, 'onpay-webhook-token');
  assert.equal(isSuccessfulOnpayWebhook(payload, payload.status), true);
  assert.equal(extractOnpayCustomer(payload).reference, '156xEnQ2OJ');
});

test('rejects webhook events other than sale.confirmed', () => {
  assert.equal(isSuccessfulOnpayWebhook({ event_type: 'sale.created' }, ''), false);
  assert.equal(isSuccessfulOnpayWebhook({ event_type: 'sale.canceled' }, ''), false);
});

test('a webhook retry cannot reopen a claimed payment for another account', async (context) => {
  const firestore = new FirestoreMock();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = firestore.fetch.bind(firestore);
  context.after(() => { globalThis.fetch = originalFetch; });

  firestore.put(`${documentsPath}/users/buyer-1`, { hasPaid: { booleanValue: false } });
  await storePaidCustomer(env, 'access-token', paidPayload('SALE-42'));
  assert.deepEqual(await claimPendingPayment(env, 'access-token', firebaseUser('buyer-1')), { claimed: true });

  assert.deepEqual(
    await storePaidCustomer(env, 'access-token', paidPayload('SALE-42')),
    { alreadyClaimed: true },
  );
  firestore.put(`${documentsPath}/users/buyer-2`, { hasPaid: { booleanValue: false } });
  assert.deepEqual(
    await claimPendingPayment(env, 'access-token', firebaseUser('buyer-2')),
    { claimed: false, reason: 'no_matching_payment' },
  );
  assert.equal(firestore.documents.get(`${documentsPath}/users/buyer-2`).fields.hasPaid.booleanValue, false);
});

test('a claim retries when a newer payment replaces the pending record', async (context) => {
  const firestore = new FirestoreMock();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = firestore.fetch.bind(firestore);
  context.after(() => { globalThis.fetch = originalFetch; });

  firestore.put(`${documentsPath}/users/buyer-1`, { hasPaid: { booleanValue: false } });
  await storePaidCustomer(env, 'access-token', paidPayload('SALE-OLD'));
  firestore.afterPendingRead = () => storePaidCustomer(env, 'access-token', paidPayload('SALE-NEW'));

  assert.deepEqual(await claimPendingPayment(env, 'access-token', firebaseUser('buyer-1')), { claimed: true });
  const user = firestore.documents.get(`${documentsPath}/users/buyer-1`);
  assert.equal(user.fields.paymentReference.stringValue, 'SALE-NEW');

  const newPaymentId = await sha256Hex('SALE-NEW');
  assert.equal(
    firestore.documents.get(`${documentsPath}/onpayPayments/${newPaymentId}`).fields.claimStatus.stringValue,
    'claimed',
  );
});
