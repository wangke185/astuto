import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_CLOCK_SKEW_SECONDS = 5 * 60;

type VerifyInput = {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  secret: string;
  nowSeconds?: number;
  allowedClockSkewSeconds?: number;
};

export type VerifyResult =
  | { ok: true; timestamp: number }
  | { ok: false; reason: string };

function parseSignature(value: string): Buffer | null {
  const hex = value.startsWith("sha256=") ? value.slice(7) : value;
  if (!/^[a-f0-9]{64}$/i.test(hex)) return null;
  return Buffer.from(hex, "hex");
}

export function signWebhook(rawBody: string, timestamp: number, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
}

export function verifyWebhookSignature(input: VerifyInput): VerifyResult {
  const {
    rawBody,
    timestampHeader,
    signatureHeader,
    secret,
    nowSeconds = Math.floor(Date.now() / 1000),
    allowedClockSkewSeconds = DEFAULT_CLOCK_SKEW_SECONDS,
  } = input;

  if (!secret || secret.length < 32) {
    return { ok: false, reason: "server_secret_invalid" };
  }

  if (!timestampHeader || !/^\d{10}$/.test(timestampHeader)) {
    return { ok: false, reason: "timestamp_invalid" };
  }

  const timestamp = Number(timestampHeader);
  if (Math.abs(nowSeconds - timestamp) > allowedClockSkewSeconds) {
    return { ok: false, reason: "timestamp_stale" };
  }

  if (!signatureHeader) {
    return { ok: false, reason: "signature_missing" };
  }

  const received = parseSignature(signatureHeader);
  if (!received) {
    return { ok: false, reason: "signature_invalid_format" };
  }

  const expected = Buffer.from(signWebhook(rawBody, timestamp, secret), "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true, timestamp };
}
