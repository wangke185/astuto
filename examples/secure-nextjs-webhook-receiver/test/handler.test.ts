import assert from "node:assert/strict";
import test from "node:test";
import { handleWebhook } from "../lib/webhooks/handler.ts";
import { signWebhook } from "../lib/webhooks/signature.ts";
import type { WebhookEvent } from "../lib/webhooks/event.ts";
import type { IdempotencyStore } from "../lib/webhooks/store.ts";
import type { WebhookQueue } from "../lib/webhooks/queue.ts";

const secret = "0123456789abcdef0123456789abcdef";
const now = 1_800_000_000;

class TestStore implements IdempotencyStore {
  private readonly ids = new Set<string>();
  async reserve(eventId: string): Promise<boolean> {
    if (this.ids.has(eventId)) return false;
    this.ids.add(eventId);
    return true;
  }
}

class TestQueue implements WebhookQueue {
  readonly events: WebhookEvent[] = [];
  async enqueue(event: WebhookEvent): Promise<void> {
    this.events.push(event);
  }
}

function signedRequest(body: string): Request {
  const timestamp = String(now);
  const signature = signWebhook(body, now, secret);
  return new Request("https://example.test/api/webhooks/example", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": `sha256=${signature}`,
    },
    body,
  });
}

test("accepts, queues, and acknowledges a valid event", async () => {
  const queue = new TestQueue();
  const response = await handleWebhook(
    signedRequest(JSON.stringify({
      id: "evt_1",
      type: "invoice.paid",
      createdAt: "2026-07-23T00:00:00.000Z",
      data: { invoiceId: "inv_1" },
    })),
    { secret, idempotencyStore: new TestStore(), queue, nowSeconds: now },
  );

  assert.equal(response.status, 202);
  assert.equal(queue.events.length, 1);
  assert.equal(queue.events[0]?.id, "evt_1");
});

test("acknowledges a duplicate without queueing twice", async () => {
  const queue = new TestQueue();
  const store = new TestStore();
  const body = JSON.stringify({
    id: "evt_duplicate",
    type: "invoice.paid",
    createdAt: "2026-07-23T00:00:00.000Z",
    data: {},
  });

  const first = await handleWebhook(signedRequest(body), {
    secret,
    idempotencyStore: store,
    queue,
    nowSeconds: now,
  });
  const second = await handleWebhook(signedRequest(body), {
    secret,
    idempotencyStore: store,
    queue,
    nowSeconds: now,
  });

  assert.equal(first.status, 202);
  assert.equal(second.status, 200);
  assert.equal(queue.events.length, 1);
});

test("rejects invalid signatures", async () => {
  const request = new Request("https://example.test/api/webhooks/example", {
    method: "POST",
    headers: {
      "x-webhook-timestamp": String(now),
      "x-webhook-signature": "sha256=" + "0".repeat(64),
    },
    body: JSON.stringify({ id: "evt_1" }),
  });

  const response = await handleWebhook(request, {
    secret,
    idempotencyStore: new TestStore(),
    queue: new TestQueue(),
    nowSeconds: now,
  });
  assert.equal(response.status, 401);
});

test("rejects oversized bodies", async () => {
  const response = await handleWebhook(signedRequest("x".repeat(11)), {
    secret,
    idempotencyStore: new TestStore(),
    queue: new TestQueue(),
    nowSeconds: now,
    maxBodyBytes: 10,
  });
  assert.equal(response.status, 413);
});
