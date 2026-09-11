# OnPay → Firebase account activation

Users register only through `https://promptly.onpay.my/order/form/1`. When OnPay confirms the sale, it calls the Netlify webhook. The webhook creates the Firebase Authentication user and writes `users/{uid}.hasPaid = true`. The browser never receives permission to set its own payment status.

## 1. Prepare the OnPay form

The form must send these values to its webhook:

- customer e-mail (required)
- password (required, at least 6 characters)
- customer name (optional)
- invoice/order reference (recommended)
- confirmed sale/payment status, if included by OnPay

The receiver recognizes common Malay and English names such as `email`/`emel`, `password`/`kata_laluan`, `name`/`nama`, and `invoice`/`invois`. OnPay's public guide does not publish a complete webhook payload schema, so confirm the exact field names with OnPay support or one test sale.

Never include the password in OnPay e-mail templates, invoices, analytics, or application logs. It is sent over HTTPS to Firebase Authentication only when a new paid account is created and is never written to Firestore. If OnPay cannot guarantee that this custom field remains private, remove it from OnPay and use Firebase's password-reset flow to let the user choose a password directly in Firebase instead.

## 2. Configure Netlify

In **Netlify → Site configuration → Environment variables**, add:

```text
FIREBASE_PROJECT_ID=ai-prompt-10289
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-service-account-private-key
ONPAY_WEBHOOK_SECRET=a-long-random-secret
VITE_SUPPORT_EMAIL=support@your-domain.my
VITE_SUPPORT_CONTACT=Your address or telephone number
```

Create the Firebase service account under **Firebase/Google Cloud → Project settings → Service accounts**. Keep its private key only in Netlify. Generate `ONPAY_WEBHOOK_SECRET` as a random value of at least 32 characters.

## 3. Configure the OnPay webhook

In OnPay:

1. Go to **Senarai → Borang** and edit form `1`.
2. Find **Webhook**.
3. Under **Aktiviti**, select only **Jualan Disahkan / Disahkan**.
4. Enter the following URL with your values:

```text
https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/onpay-webhook?token=YOUR_ONPAY_WEBHOOK_SECRET
```

5. Save the form.

Do not attach this webhook to new, pending, or cancelled sales. It is protected by a timing-safe secret comparison and repeated calls are safe: the existing account is updated rather than duplicated.

## 4. Redirect after payment

In form `1`, open **Halaman Terima Kasih**, enable the redirect option, and use:

```text
https://YOUR-APP-DOMAIN/?payment=success
```

The login page then tells the customer that activation may take a short time. The direct OnPay payment link also appears beneath the login form for new visitors and on the payment-gate page for an existing unpaid account.

## 5. Deploy and test

Deploy the site to Netlify, then test:

1. Open the webhook URL using the correct `token`; a GET request should return `OnPay webhook is ready`.
2. Complete a test payment through form `1`.
3. Confirm that Firebase Authentication contains the new e-mail account.
4. Confirm that `users/{uid}` contains `hasPaid: true`, `paymentProvider: onpay`, and `paidAt`.
5. Confirm that the password is absent from both `users` and `onpayPayments`.
6. Log in using the credentials entered in OnPay and accept the T&C checkbox.

Deploy the Firestore rules with:

```powershell
npx firebase-tools deploy --only firestore:rules
```

Your OnPay plan must include **API & Webhook**. The webhook must use HTTPS and must return HTTP 200 to OnPay.
