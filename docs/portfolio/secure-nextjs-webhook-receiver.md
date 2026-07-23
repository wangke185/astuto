# Build a Secure Webhook Receiver in Next.js with TypeScript

Webhooks look simple: accept a `POST`, parse JSON, and run some business logic. In production, that is not enough.

A reliable receiver must preserve the exact request body for signature verification, reject replayed requests, limit payload size, avoid duplicate processing, and return quickly enough that the sender does not retry unnecessarily.

This tutorial builds a provider-neutral webhook receiver with the Next.js App Router and TypeScript. The example uses an HMAC-SHA256 signature over:

```text
<timestamp>.<raw request body>
```

Real providers use different header names and signing formats. Keep the architecture, but implement the exact algorithm from the provider's official documentation.

## What we will build

The endpoint will:

1. use a Next.js Route Handler;
2. read the body as raw text before parsing JSON;
3. verify an HMAC signature with a constant-time comparison;
4. reject stale timestamps to reduce replay risk;
5. enforce a payload-size limit;
6. validate the event envelope;
7. record an idempotency key before processing;
8. acknowledge quickly and move slow work to a queue.

## Project structure

```text
app/
  api/
    webhooks/
      example/
        route.ts
lib/
  webhooks/
    signature.ts
    store.ts
    queue.ts
```

Next.js Route Handlers are defined in `route.ts` files inside the `app` directory and support standard HTTP methods including `POST`.

## 1. Configure the secret

Create a long, random secret and store it in the deployment environment:

```bash
WEBHOOK_SECRET=replace-with-a-random-secret
```

Do not commit the real secret to source control. Do not reuse an application password, API token, or database credential.

## 2. Verify the signature

Create `lib/webhooks/signature.ts`:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

const ALLOWED_CLOCK_SKEW_SECONDS = 5 * 60;

type VerifyInput = {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  secret: string;
  nowSeconds?: number;
};

export type VerifyResult =
  | { ok: true; timestamp: number }
  | { ok: false; reason: string };

function parseSignature(value: string): Buffer | null {
  const hex = value.startsWith("sha256=") ? value.slice(7) : value;

  if (!/^[a-f0-9]{64}$/i.test(hex)) {
    return null;
  }

  return Buffer.from(hex, "hex");
}

export function verifyWebhookSignature({
  rawBody,
  timestampHeader,
  signatureHeader,
  secret,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyInput): VerifyResult {
  if (!timestampHeader || !signatureHeader) {
    return { ok: false, reason: "Missing signature headers" };
  }

  if (!/^\d+$/.test(timestampHeader)) {
    return { ok: false, reason: "Invalid timestamp" };
  }

  const timestamp = Number(timestampHeader);

  if (!Number.isSafeInteger(timestamp)) {
    return { ok: false, reason: "Invalid timestamp" };
  }

  if (Math.abs(nowSeconds - timestamp) > ALLOWED_CLOCK_SKEW_SECONDS) {
    return { ok: false, reason: "Stale webhook" };
  }

  const received = parseSignature(signatureHeader);

  if (!received) {
    return { ok: false, reason: "Invalid signature format" };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest();

  if (received.length !== expected.length) {
    return { ok: false, reason: "Invalid signature" };
  }

  if (!timingSafeEqual(received, expected)) {
    return { ok: false, reason: "Invalid signature" };
  }

  return { ok: true, timestamp };
}
```

Two details matter:

- Compute the HMAC from the exact bytes sent by the provider. Parsing and re-serializing JSON can change whitespace or key order and invalidate a legitimate signature.
- Use `timingSafeEqual` instead of comparing secret-derived values with `===`. Node.js documents it as a constant-time byte comparison suitable for HMAC digests, while warning that surrounding code must also avoid timing leaks.

## 3. Add an idempotency store

Webhook providers retry. Your application may receive the same event more than once because of network timeouts, deployment restarts, or manual replay tools.

The database must enforce uniqueness. An in-memory `Set` is not sufficient because it disappears on restart and is not shared across instances.

```ts
// lib/webhooks/store.ts
export interface WebhookEventStore {
  /** Atomically inserts the event ID. */
  claim(eventId: string): Promise<boolean>;
}

export const webhookEventStore: WebhookEventStore = {
  async claim(eventId) {
    // Replace with a database insert protected by a UNIQUE constraint.
    // inserted -> true
    // unique-constraint conflict -> false
    throw new Error(`Webhook store not configured for ${eventId}`);
  },
};
```

A relational table might contain:

```sql
CREATE TABLE webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'accepted'
);
```

The uniqueness constraint is essential. A read-then-insert sequence without a constraint can still process duplicates under concurrency.

## 4. Queue slow work

The request should authenticate, validate, claim the event, enqueue work, and return. Email delivery, CRM synchronization, PDF generation, or AI processing should happen outside the request path.

```ts
// lib/webhooks/queue.ts
export type AcceptedWebhook = {
  id: string;
  type: string;
  data: unknown;
};

export async function enqueueWebhook(
  event: AcceptedWebhook,
): Promise<void> {
  // Replace with BullMQ, SQS, Cloud Tasks, a durable database queue,
  // or another system that provides retry and observability.
  console.info("Webhook accepted for asynchronous processing", {
    eventId: event.id,
    eventType: event.type,
  });
}
```

Do not use an untracked, fire-and-forget promise as a durability strategy. A serverless process may terminate after the response.

## 5. Implement the Route Handler

Create `app/api/webhooks/example/route.ts`:

```ts
import { Buffer } from "node:buffer";

import { enqueueWebhook } from "@/lib/webhooks/queue";
import { verifyWebhookSignature } from "@/lib/webhooks/signature";
import { webhookEventStore } from "@/lib/webhooks/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

type EventEnvelope = {
  id: string;
  type: string;
  data: unknown;
};

function isEventEnvelope(value: unknown): value is EventEnvelope {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    candidate.id.length <= 200 &&
    typeof candidate.type === "string" &&
    candidate.type.length > 0 &&
    candidate.type.length <= 200 &&
    "data" in candidate
  );
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    console.error("WEBHOOK_SECRET is not configured");
    return Response.json(
      { error: "Webhook endpoint is unavailable" },
      { status: 503 },
    );
  }

  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Unable to read body" }, { status: 400 });
  }

  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const verification = verifyWebhookSignature({
    rawBody,
    timestampHeader: request.headers.get("x-webhook-timestamp"),
    signatureHeader: request.headers.get("x-webhook-signature"),
    secret,
  });

  if (!verification.ok) {
    console.warn("Webhook verification failed", {
      reason: verification.reason,
    });

    return Response.json({ error: "Invalid webhook" }, { status: 401 });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isEventEnvelope(parsed)) {
    return Response.json({ error: "Invalid event envelope" }, { status: 422 });
  }

  let claimed: boolean;

  try {
    claimed = await webhookEventStore.claim(parsed.id);
  } catch (error) {
    console.error("Failed to claim webhook event", {
      eventId: parsed.id,
      error,
    });

    return Response.json({ error: "Temporary failure" }, { status: 503 });
  }

  if (!claimed) {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    await enqueueWebhook(parsed);
  } catch (error) {
    console.error("Failed to enqueue webhook", {
      eventId: parsed.id,
      error,
    });

    return Response.json({ error: "Temporary failure" }, { status: 503 });
  }

  return Response.json({ received: true }, { status: 202 });
}
```

The Node.js runtime is selected explicitly because this example imports `node:crypto` and `Buffer`. Next.js documents `nodejs` as the default Route Handler runtime, but making the dependency visible prevents accidental runtime changes later.

## 6. Test the signature helper

The cryptographic helper is deterministic, so it should be tested separately from the framework.

```ts
// lib/webhooks/signature.test.ts
import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyWebhookSignature } from "./signature";

const secret = "test-secret";
const nowSeconds = 1_800_000_000;
const rawBody = JSON.stringify({
  id: "evt_123",
  type: "invoice.paid",
  data: { invoiceId: "inv_123" },
});

function sign(timestamp: number, body: string): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
}

describe("verifyWebhookSignature", () => {
  it("accepts a valid signature", () => {
    const result = verifyWebhookSignature({
      rawBody,
      timestampHeader: String(nowSeconds),
      signatureHeader: sign(nowSeconds, rawBody),
      secret,
      nowSeconds,
    });

    expect(result).toEqual({ ok: true, timestamp: nowSeconds });
  });

  it("rejects a modified body", () => {
    const result = verifyWebhookSignature({
      rawBody: `${rawBody} `,
      timestampHeader: String(nowSeconds),
      signatureHeader: sign(nowSeconds, rawBody),
      secret,
      nowSeconds,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a stale timestamp", () => {
    const oldTimestamp = nowSeconds - 301;

    const result = verifyWebhookSignature({
      rawBody,
      timestampHeader: String(oldTimestamp),
      signatureHeader: sign(oldTimestamp, rawBody),
      secret,
      nowSeconds,
    });

    expect(result).toEqual({ ok: false, reason: "Stale webhook" });
  });

  it("rejects a malformed digest without throwing", () => {
    const result = verifyWebhookSignature({
      rawBody,
      timestampHeader: String(nowSeconds),
      signatureHeader: "not-a-digest",
      secret,
      nowSeconds,
    });

    expect(result).toEqual({
      ok: false,
      reason: "Invalid signature format",
    });
  });
});
```

The Route Handler also needs integration tests for missing headers, malformed JSON, oversized payloads, duplicate event IDs, database failure, queue failure, and a valid event returning `202`.

## 7. Decide which status codes cause retries

Providers differ, but a useful policy is:

| Situation | Suggested response | Reason |
|---|---:|---|
| Valid event accepted | `202` | Processing continues asynchronously |
| Duplicate event | `200` | Stop unnecessary retries |
| Invalid signature | `401` | Retrying the same request will not fix it |
| Invalid schema | `422` | The event is authenticated but unusable |
| Payload too large | `413` | Enforce a bounded request size |
| Database or queue unavailable | `503` | The provider may retry later |

Check the provider's retry rules before relying on this table. Some providers retry every non-2xx response; others use a narrower policy.

## Production checklist

Before launch, confirm:

- The signing secret is stored in an environment secret manager.
- The provider's exact signature format is implemented.
- The raw body is verified before JSON parsing.
- Timestamp tolerance matches the provider's documented behavior.
- Event IDs are protected by a database uniqueness constraint.
- Slow work is placed on a durable queue.
- Logs include event IDs and types, but not secrets or full customer payloads.
- Metrics track verification failures, duplicates, queue delay, retries, and processing failures.
- Alerts exist for sustained `5xx` responses and queue backlog.
- Secret rotation has been tested.
- A replay procedure exists for failed events.

## Common mistakes

### Parsing JSON before signature verification

A signature usually covers the original payload bytes. Re-serializing a parsed object may produce different bytes.

### Treating duplicate delivery as an error

Duplicate delivery is normal. Claim the event atomically and return success when it was already processed.

### Performing all work inside the request

Long processing increases timeout risk and causes retries. Authenticate and enqueue first.

### Trusting `Content-Length` alone

The header may be missing or inaccurate. Check the actual body size after reading it as well.

### Comparing signatures with ordinary string equality

Use a constant-time comparison for secret-derived values and ensure both inputs have the same byte length first.

### Logging the full payload

Webhook bodies can contain personal data, payment details, or confidential business information. Log identifiers and structured failure metadata instead.

## References

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js `route.ts` reference and webhook example](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js route segment runtime configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Node.js `crypto.createHmac` and `crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html)

## Final result

A production webhook receiver is not just a `POST` endpoint. It is a small reliability boundary between two systems.

The secure sequence is:

```text
read raw body
→ enforce size limit
→ verify timestamp and signature
→ parse and validate the event
→ claim the event atomically
→ enqueue durable work
→ acknowledge quickly
```

That sequence limits forgery, replay, duplicate side effects, timeout-driven retries, and unbounded request work while keeping the implementation understandable and testable.
