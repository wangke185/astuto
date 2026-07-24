# Stripe + Supabase Booking Webhook Proof

A compact, framework-neutral TypeScript proof for a booking payment flow that must coordinate Stripe webhook delivery, a held calendar slot, and durable booking state.

This is public implementation evidence, not a claim of confidential client work or a production deployment for maxstern.org.

## What it demonstrates

- raw-body Stripe-style HMAC-SHA256 verification;
- `Stripe-Signature` timestamp replay protection;
- constant-time comparison across multiple `v1` signatures;
- handling of `payment_intent.succeeded` and `payment_intent.payment_failed`;
- event-level idempotency;
- booking/calendar metadata validation;
- idempotency keys passed to calendar confirm/release operations;
- retry-safe behavior when an external calendar operation fails;
- a Supabase/Postgres migration with booking, billing, rate-history, approval and webhook-event tables;
- database functions that record the Stripe event and booking transition atomically;
- focused TypeScript tests and CI.

## Run locally

```bash
npm install --no-audit --no-fund
npm test
npm run typecheck
npm run build
```

## Next.js App Router integration shape

A route handler should read the body before any JSON parsing:

```ts
const rawBody = await request.text();
const stripeSignature = request.headers.get("stripe-signature");

const response = await handleStripeWebhook({
  request: { rawBody, stripeSignature },
  endpointSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  repository,
  calendar,
});

return Response.json(response.body, { status: response.status });
```

The repository adapter should implement `markPaid` and `markPaymentFailed` through the migration's database functions. A production implementation should use a service-role connection only inside the trusted server boundary and should never expose that credential to the browser.

## Failure model

Stripe can retry after a partial failure. The external Cal.com operation therefore receives the Stripe event ID as an idempotency key. The webhook event is recorded only when the corresponding database transition succeeds.

A calendar confirmation can still succeed while the following database call fails. The next retry must safely repeat the calendar confirmation and then complete the database transition. Production delivery should also include a reconciliation job for bookings whose calendar and database states diverge beyond a defined time window.

## Scope intentionally omitted

- Stripe Checkout session creation;
- a live Stripe SDK adapter;
- a live Cal.com API adapter;
- Telegram approval commands;
- email, refunds or admin UI;
- claims of compliance certification.

Those integrations depend on the target application's existing schema, API credentials and exact business rules. This proof isolates the highest-risk webhook, idempotency and state-transition behavior before those adapters are added.
