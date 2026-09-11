import assert from 'node:assert/strict';
import test from 'node:test';

import { extractOnpayCustomer, isSuccessfulOnpayStatus } from '../functions/_lib/onpay.js';

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
