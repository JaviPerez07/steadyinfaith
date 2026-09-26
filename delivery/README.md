# Protected Faith Reset delivery

The paid files belong in `.private-reset/` (gitignored), never `public/` or the public GitHub repository. Every asset request passes through the delivery Worker. Only a valid access cookie backed by an unrevoked order can fetch the app and downloads.

## Stripe configuration

- Product: `prod_VKGGoDsDnTTWg7`; price `price_1UJbjkE2RGgqV82nrXLScj8B`; USD 14 one-time.
- Live account `acct_1SyC20E2RGgqV82n`; Payment Link `plink_1UJbq9E2RGgqV82nUM5HRIR6`, quantity 1, no adjustable quantity or promotions.
- Redirect after completion to `https://joinsteadyinfaith.com/reset/claim?session_id={CHECKOUT_SESSION_ID}`.
- Configure webhook `https://joinsteadyinfaith.com/reset/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`.
- Set Worker secret `STRIPE_WEBHOOK_SECRET`, and variables `STRIPE_PAYMENT_LINK_ID` and `PAYMENT_LINK_URL` from Stripe responses. Never commit secrets.
- No real-money checkout has been executed by Codex. For further Stripe end-to-end testing use an isolated test environment with a separate database/worker and `STRIPE_LIVE_MODE=false`.
- Landing CTA points to `/reset/checkout`. Hosted delivery is activated after local security tests, live unpaid signed-message connectivity checks, and browser validation.
- Do not enable Stripe Tax without confirmed registrations. No tax handling has been configured here.

## Access and recovery

Fulfillment is from signed Stripe webhooks, not the redirect. Sessions must be paid, in the expected mode, from the exact Payment Link, USD 1400 subtotal. Refund/dispute tombstones prevent replay or out-of-order events from restoring access. Repeated event delivery is idempotent.

After payment confirmation, the success page sets a secure HttpOnly cookie and displays a random personal access key. The database stores only its hash, the session hash, payment intent and creation time. The customer must save the key to return on another browser. This is bearer access, not an email-authenticated account. A person can share a downloaded file or their key; this is not DRM. A new claim rotates the key and invalidates older cookies.

The buyer library links to all files, explains local-only journal storage, and links to free Skool. No journal answers reach the server. No email delivery or automated email-based recovery has been configured; do not claim otherwise. A lost key without the original Stripe confirmation session needs manual purchase verification; do not promise automatic email recovery. START-HERE was rebuilt with the hosted URL and access-key instructions, and all three pages were visually checked.

## Validation

`node --test delivery/tests/access.test.mjs` exercises anonymous/forged access, invalid signatures, wrong amount/product/mode, pending then successful payment, retries, refunds before/after payment, recovery, CSRF and sales disabled. These are local integration tests, not a real Stripe checkout or physical-phone certification.

Deploy: `node node_modules/wrangler/bin/wrangler.js deploy --config delivery/wrangler.jsonc`

Sales enabled 2026-09-25. The original free product remains available. Buyer email delivery is NOT configured; access is delivered on the post-payment page and can be saved as a key file. A real paid transaction and physical iPhone/Android tests remain unperformed.
