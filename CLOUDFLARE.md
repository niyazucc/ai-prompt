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

New users register in the app before paying. The app creates an unpaid Firebase
profile and keeps the prompt builder locked. Configure OnPay's successful-sale
(`Jualan Disahkan`) callback to send a POST request to:

```text
https://promptlytool.my/api/onpay-webhook?token=<ONPAY_WEBHOOK_SECRET>
```

The payment email must match the registration email. The Function validates the
shared secret and successful status, finds the Firebase profile, and updates its
`hasPaid` field using the server-side Firebase service account. Required Pages
secrets are `ONPAY_WEBHOOK_SECRET`, `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

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
