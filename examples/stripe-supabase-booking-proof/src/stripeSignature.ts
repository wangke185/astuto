import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifyStripeSignatureInput {
  rawBody: string;
  signatureHeader: string;
  endpointSecret: string;
  nowSeconds?: number;
  toleranceSeconds?: number;
}

interface ParsedStripeSignature {
  timestamp: number;
  v1Signatures: string[];
}

function parseStripeSignatureHeader(header: string): ParsedStripeSignature {
  const fields = header.split(",").map((part) => part.trim());
  let timestamp: number | undefined;
  const v1Signatures: string[] = [];

  for (const field of fields) {
    const separator = field.indexOf("=");
    if (separator === -1) continue;

    const key = field.slice(0, separator);
    const value = field.slice(separator + 1);

    if (key === "t") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) timestamp = parsed;
    } else if (key === "v1" && value.length > 0) {
      v1Signatures.push(value);
    }
  }

  if (timestamp === undefined || v1Signatures.length === 0) {
    throw new Error("Malformed Stripe-Signature header");
  }

  return { timestamp, v1Signatures };
}

function safeHexEqual(expectedHex: string, actualHex: string): boolean {
  if (!/^[0-9a-f]+$/i.test(actualHex)) return false;

  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function verifyStripeSignature({
  rawBody,
  signatureHeader,
  endpointSecret,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
}: VerifyStripeSignatureInput): void {
  if (endpointSecret.length === 0) {
    throw new Error("Stripe endpoint secret is required");
  }

  const { timestamp, v1Signatures } = parseStripeSignatureHeader(signatureHeader);
  const ageSeconds = Math.abs(nowSeconds - timestamp);
  if (ageSeconds > toleranceSeconds) {
    throw new Error("Stripe webhook timestamp is outside the replay window");
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", endpointSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const valid = v1Signatures.some((candidate) => safeHexEqual(expected, candidate));
  if (!valid) {
    throw new Error("Invalid Stripe webhook signature");
  }
}
