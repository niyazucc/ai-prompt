# OnPay → Firebase payment activation

The app now sends unpaid users to an existing OnPay sales form. OnPay calls a
Netlify Function when the sale is confirmed, and that function updates the
matching Firebase user document to `hasPaid: true`.

## How accounts are matched

The webhook matches the customer email received from OnPay to Firebase Auth.
The customer therefore **must use the same email address in both places**:

1. Register in the Prompt AI app.
2. Click **Bayar dengan OnPay**.
3. Enter the same registered email in the OnPay form.

The payment page opens in a separate tab so the app can keep listening to the
Firestore user document and unlock automatically.

## 1. Netlify environment variables

In **Netlify → Site configuration → Environment variables**, add:

```text
FIREBASE_PROJECT_ID=ai-prompt-10289
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-service-account-private-key
ONPAY_WEBHOOK_SECRET=a-long-random-secret
VITE_ONPAY_PAYMENT_URL=https://promptly.onpay.my/
```

Generate `ONPAY_WEBHOOK_SECRET` as a long random value (at least 32 characters).
After changing a `VITE_` variable, trigger a new Netlify deployment because it
is embedded into the frontend at build time.

## 2. Configure the OnPay form webhook

Open the sales form in the OnPay admin dashboard:

1. Go to **Senarai → Borang**.
2. Edit the form used by this app.
3. Find the **Webhook** section.
4. Under **Aktiviti**, select only the confirmed-sale activity, normally named
   **Jualan Disahkan** or **Disahkan**.
5. Enter this URL, replacing both placeholders:

```text
https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/onpay-webhook?token=YOUR_ONPAY_WEBHOOK_SECRET
```

6. Save the form.

Do not configure this webhook for a new, pending, or cancelled sale. The public
OnPay tutorial says webhook delivery follows the selected Activity and the URL
must respond with HTTP 200.

## 3. Test the complete flow

1. Deploy the current project to Netlify.
2. Open the webhook URL in a browser. A correct secret returns:

   ```json
   {"message":"OnPay webhook is ready"}
   ```

3. Register a test Firebase account.
4. Pay through OnPay using exactly the same email.
5. In Firestore, inspect `users/{uid}`. It should contain:

   ```text
   hasPaid: true
   paymentProvider: onpay
   paidAt: <timestamp>
   ```

6. A minimal audit record is also stored in `onpayPayments`.

## Troubleshooting

- **401 Unauthorized:** the `token` in the OnPay webhook URL does not match
  `ONPAY_WEBHOOK_SECRET` in Netlify.
- **No matching account:** the email entered in OnPay differs from the Firebase
  Auth email, or the user paid before registering.
- **Webhook received but no email found:** check the Netlify Function log entry
  containing `Fields:`. OnPay's public tutorial does not publish a payload
  schema; those field names show what this specific OnPay form sends and can be
  added to the extractor if needed.
- **Function 404:** deploy on Netlify and ensure `netlify.toml` points to
  `netlify/functions`. A Cloudflare Pages domain cannot execute Netlify
  Functions.
