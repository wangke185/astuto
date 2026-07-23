# Secure Next.js Webhook Receiver

A small, runnable Next.js App Router example showing a provider-neutral webhook receiver with:

- raw-body HMAC-SHA256 verification;
- replay-window validation;
- constant-time digest comparison;
- payload-size limits;
- event-envelope validation;
- idempotency reservation;
- a durable-queue boundary;
- focused unit tests and a production build.

## Run

```bash
cp .env.example .env.local
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Generate a signature over `<timestamp>.<raw-body>` and send it as `x-webhook-signature`; send the Unix timestamp as `x-webhook-timestamp`.

## Production limitations

The included in-memory idempotency store and console queue are deliberately demo-only. Replace them with Redis or SQL atomic uniqueness and a durable queue. Adapt header names and signature construction to the provider's official specification. Do not log secrets or raw customer payloads.

This example is a portfolio artifact, not a complete security audit or provider SDK.
