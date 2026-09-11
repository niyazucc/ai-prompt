# Cloudflare Pages deployment

The Vite frontend and Pages Functions backend deploy as one Cloudflare Pages
project. Static files are built into `dist/`; backend routes live in `functions/`.

## Commands

```bash
npm run cf:dev
npm run deploy
```

The included backend health route is available at `/api/health`. Frontend code
can call a Pages Function on the same origin, so no separate backend URL or CORS
configuration is required:

```ts
const response = await fetch('/api/health');
const status = await response.json();
```

## Secrets and bindings

Keep local backend secrets in `.dev.vars`. For production, add them in the
Cloudflare dashboard under Workers & Pages > sales-prompt-studio > Settings >
Variables and Secrets. Do not use a `VITE_` prefix for secrets because Vite
embeds such values in the browser bundle.

Cloudflare services such as D1, KV, R2, Queues, and service bindings can be
declared in `wrangler.jsonc` and accessed from a Function as `context.env`.

## GitHub CI/CD

`.github/workflows/cloudflare-pages.yml` validates and deploys every push to
`main`. Add a repository Actions secret named `CLOUDFLARE_API_TOKEN` containing
a scoped Cloudflare token with `Account > Cloudflare Pages > Edit` and
`Zone > DNS > Edit` (limited to `promptlytool.my`). The workflow also keeps the
apex DNS record pointed at the production Pages project.

Production is served from `https://promptlytool.my`; Cloudflare Pages Functions
remain available under the same domain at `/api/*`.

## OnPay paid access

Customers create their account through the payment flow. Configure OnPay's successful-sale
(`Jualan Disahkan`) callback to send a POST request to:

```text
https://promptlytool.my/api/onpay-webhook
```

The webhook extracts the order form's `client_fullname`, `client_email`,
`client_phone_dial_code`, `client_phone_number`, and password fields. OnPay sends
its three custom form values as `extra_field_1`, `extra_field_2`, and
`extra_field_3`. Set the plain-text `ONPAY_PASSWORD_FIELD` Pages variable to the
field used by the password input; it defaults to `extra_field_1`. After validating the
shared secret and successful status, it creates or finds the Firebase Auth user,
atomically enables `users/{uid}.hasPaid`, records the transaction in
`onpayPayments`, and assigns the submitted password only when creating a new
Firebase Auth user. The password is never stored in Firestore or application
logs. If an Auth user already exists, the webhook leaves its password unchanged
and sends a Firebase password-reset email.

The public app provides login and password reset only; it does not expose a
registration form. `/api/claim-payment` remains available for accounts created
under the earlier flow and validates a signed, email-verified Firebase ID token
before claiming any pending payment.

Required Pages secrets are `ONPAY_WEBHOOK_SECRET`, `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. The public
`FIREBASE_WEB_API_KEY` binding is declared in `wrangler.jsonc`.

OnPay issues the webhook token under **Tetapan > Sistem > API & Webhook** and
sends it in the JSON request body. Store that token as an encrypted
`ONPAY_WEBHOOK_SECRET` in the Cloudflare Pages project's Variables and Secrets
settings. Saved Cloudflare secrets cannot be viewed later; generate a new OnPay
webhook token and replace the Cloudflare secret if it is lost. For local Pages
development, put the same binding in the ignored `.env` or `.dev.vars` file.

The checked-in `firestore.rules` mirrors the production rules: users can read
their own profile and create it only with `hasPaid: false`; browser clients
cannot grant themselves paid access.

Example:

```js
export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  const result = await env.DB.prepare('SELECT ? AS value').bind(payload.value).first();
  return Response.json(result);
}
```
