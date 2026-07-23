import assert from "node:assert/strict";
import test from "node:test";
import { parseWebhookEvent } from "../lib/webhooks/event.ts";

test("parses a valid event", () => {
  const event = parseWebhookEvent(JSON.stringify({
    id: "evt_123",
    type: "invoice.paid",
    createdAt: "2026-07-23T00:00:00.000Z",
    data: { invoiceId: "inv_1" },
  }));
  assert.equal(event?.id, "evt_123");
  assert.equal(event?.type, "invoice.paid");
});

test("rejects malformed JSON", () => {
  assert.equal(parseWebhookEvent("{"), null);
});

test("rejects an incomplete envelope", () => {
  assert.equal(parseWebhookEvent(JSON.stringify({ id: "evt_123" })), null);
});
