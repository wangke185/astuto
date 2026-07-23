import assert from "node:assert/strict";
import test from "node:test";
import { signWebhook, verifyWebhookSignature } from "../lib/webhooks/signature.ts";

const secret = "0123456789abcdef0123456789abcdef";
const rawBody = JSON.stringify({ id: "evt_1" });
const now = 1_800_000_000;

test("accepts a valid signed payload", () => {
  const signature = signWebhook(rawBody, now, secret);
  assert.deepEqual(
    verifyWebhookSignature({
      rawBody,
      timestampHeader: String(now),
      signatureHeader: `sha256=${signature}`,
      secret,
      nowSeconds: now,
    }),
    { ok: true, timestamp: now },
  );
});

test("rejects a modified body", () => {
  const signature = signWebhook(rawBody, now, secret);
  assert.equal(
    verifyWebhookSignature({
      rawBody: `${rawBody} `,
      timestampHeader: String(now),
      signatureHeader: signature,
      secret,
      nowSeconds: now,
    }).ok,
    false,
  );
});

test("rejects stale timestamps", () => {
  const signature = signWebhook(rawBody, now - 301, secret);
  assert.deepEqual(
    verifyWebhookSignature({
      rawBody,
      timestampHeader: String(now - 301),
      signatureHeader: signature,
      secret,
      nowSeconds: now,
    }),
    { ok: false, reason: "timestamp_stale" },
  );
});

test("rejects short server secrets", () => {
  assert.deepEqual(
    verifyWebhookSignature({
      rawBody,
      timestampHeader: String(now),
      signatureHeader: "0".repeat(64),
      secret: "short",
      nowSeconds: now,
    }),
    { ok: false, reason: "server_secret_invalid" },
  );
});
