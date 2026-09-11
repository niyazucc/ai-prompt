const SUCCESS_STATUSES = new Set([
  '1', 'confirmed', 'disahkan', 'paid', 'payment_success', 'sale_confirmed',
  'success', 'successful', 'jualan_disahkan',
]);
const EMAIL_FIELDS = ['client_email', 'email', 'buyer_email', 'buyerEmail', 'payer_email', 'customer_email', 'email_pembeli'];
const NAME_FIELDS = ['client_fullname', 'fullname', 'full_name', 'name', 'buyer_name', 'customer_name'];
const DIAL_CODE_FIELDS = ['client_phone_dial_code', 'phone_dial_code', 'dial_code'];
const PHONE_FIELDS = ['client_phone_number', 'phone', 'phone_number', 'buyer_phone', 'customer_phone'];
const STATUS_FIELDS = ['status', 'payment_status', 'paymentStatus', 'transaction_status', 'status_bayaran'];
const REFERENCE_FIELDS = ['uid', 'sale_id', 'reference', 'ref', 'order_id', 'orderId', 'invoice_no', 'transaction_id', 'trans_id', 'id'];
const DEFAULT_PASSWORD_FIELD = 'extra_field_1';

function firstValue(payload, fields) {
  for (const field of fields) {
    if (payload[field]) return payload[field];
  }
  return '';
}

export function extractOnpayCustomer(payload) {
  const email = firstValue(payload, EMAIL_FIELDS).trim().toLowerCase();
  const name = firstValue(payload, NAME_FIELDS).trim();
  const dialCode = firstValue(payload, DIAL_CODE_FIELDS).replace(/[^0-9]/g, '');
  let localPhone = firstValue(payload, PHONE_FIELDS).replace(/[^0-9]/g, '');
  if (dialCode && localPhone.startsWith('0')) localPhone = localPhone.slice(1);
  return {
    email,
    name,
    phone: localPhone ? `${dialCode ? `+${dialCode}` : ''}${localPhone}` : '',
    status: firstValue(payload, STATUS_FIELDS).toLowerCase(),
    reference: firstValue(payload, REFERENCE_FIELDS),
  };
}

export function isSuccessfulOnpayStatus(status) {
  // A missing status is allowed because this URL is assigned only to OnPay's
  // successful-sale ("Jualan Disahkan") activity.
  return !status || SUCCESS_STATUSES.has(status);
}

export function extractOnpayPassword(payload, configuredField = DEFAULT_PASSWORD_FIELD) {
  const field = String(configuredField || DEFAULT_PASSWORD_FIELD).trim();
  return typeof payload[field] === 'string' ? payload[field] : '';
}

export function isSuccessfulOnpayWebhook(payload, status) {
  const eventType = String(payload.event_type || '').trim().toLowerCase();
  return eventType ? eventType === 'sale.confirmed' : isSuccessfulOnpayStatus(status);
}
