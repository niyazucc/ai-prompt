import assert from 'node:assert/strict';
import test from 'node:test';

import { ensureFirebaseUser, sendPasswordSetupEmail } from '../functions/_lib/firebase-auth.js';

const env = {
  FIREBASE_PROJECT_ID: 'paid-first-test',
  FIREBASE_WEB_API_KEY: 'web-api-key',
};

test('reuses an existing Firebase user for an approved OnPay email', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, init) => {
    assert.match(url, /accounts:lookup/);
    assert.equal(init.headers.authorization, 'Bearer access-token');
    assert.deepEqual(JSON.parse(init.body), { email: ['buyer@example.com'] });
    return Response.json({ users: [{ localId: 'existing-user' }] });
  };

  assert.deepEqual(
    await ensureFirebaseUser(env, 'access-token', { email: 'buyer@example.com', name: 'Buyer' }),
    { localId: 'existing-user', created: false },
  );
});

test('creates a Firebase user only after no account matches the paid email', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body) });
    if (url.includes('accounts:lookup')) return Response.json({});
    return Response.json({ localId: 'new-user' });
  };

  assert.deepEqual(
    await ensureFirebaseUser(env, 'access-token', { email: 'buyer@example.com', name: 'Buyer Name' }),
    { localId: 'new-user', created: true },
  );
  assert.equal(requests.length, 2);
  assert.equal(requests[1].body.email, 'buyer@example.com');
  assert.equal(requests[1].body.displayName, 'Buyer Name');
  assert.equal(requests[1].body.emailVerified, false);
  assert.ok(requests[1].body.password.length >= 32);
});

test('uses a submitted OnPay password when creating a Firebase user', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body) });
    if (url.includes('accounts:lookup')) return Response.json({});
    return Response.json({ localId: 'new-user' });
  };

  await ensureFirebaseUser(env, 'access-token', {
    email: 'buyer@example.com',
    name: 'Buyer Name',
    password: 'OnPayPass123!',
  });

  assert.equal(requests[1].body.password, 'OnPayPass123!');
});

test('requests a password setup email for the paid account', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, init) => {
    assert.match(url, /accounts:sendOobCode/);
    assert.equal(init.headers['x-firebase-locale'], 'ms');
    assert.deepEqual(JSON.parse(init.body), {
      requestType: 'PASSWORD_RESET',
      email: 'buyer@example.com',
    });
    return Response.json({ email: 'buyer@example.com' });
  };

  await sendPasswordSetupEmail(env, 'buyer@example.com');
});
