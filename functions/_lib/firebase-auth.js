function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function readError(response) {
  const result = await response.clone().json().catch(() => null);
  return result?.error?.message || `HTTP_${response.status}`;
}

async function adminAuthRequest(env, accessToken, path, body) {
  return fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/${path}?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
}

export async function findFirebaseUserByEmail(env, accessToken, email) {
  const response = await adminAuthRequest(env, accessToken, 'accounts:lookup', { email: [email] });
  if (!response.ok) throw new Error(`Firebase user lookup failed (${await readError(response)})`);
  const result = await response.json();
  return result.users?.[0] || null;
}

export async function ensureFirebaseUser(env, accessToken, { email, name }) {
  const existing = await findFirebaseUserByEmail(env, accessToken, email);
  if (existing?.localId) return { localId: existing.localId, created: false };

  const response = await adminAuthRequest(env, accessToken, 'accounts', {
    email,
    password: randomPassword(),
    displayName: name,
    emailVerified: false,
  });
  if (response.ok) {
    const result = await response.json();
    if (!result.localId) throw new Error('Firebase account creation returned no user ID');
    return { localId: result.localId, created: true };
  }

  const message = await readError(response);
  if (message.includes('EMAIL_EXISTS')) {
    const racedUser = await findFirebaseUserByEmail(env, accessToken, email);
    if (racedUser?.localId) return { localId: racedUser.localId, created: false };
  }
  throw new Error(`Firebase account creation failed (${message})`);
}

export async function sendPasswordSetupEmail(env, email) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-firebase-locale': 'ms',
      },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
    },
  );
  if (!response.ok) throw new Error(`Password setup email failed (${await readError(response)})`);
}
