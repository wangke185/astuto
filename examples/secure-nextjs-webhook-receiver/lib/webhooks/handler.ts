import { parseWebhookEvent } from "./event.ts";
import type { WebhookQueue } from "./queue.ts";
import { verifyWebhookSignature } from "./signature.ts";
import type { IdempotencyStore } from "./store.ts";

export type HandlerDependencies = {
  secret: string;
  idempotencyStore: IdempotencyStore;
  queue: WebhookQueue;
  maxBodyBytes?: number;
  idempotencyTtlSeconds?: number;
  nowSeconds?: number;
};

export async function handleWebhook(
  request: Request,
  dependencies: HandlerDependencies,
): Promise<Response> {
  const maxBodyBytes = dependencies.maxBodyBytes ?? 256 * 1024;
  const idempotencyTtlSeconds =
    dependencies.idempotencyTtlSeconds ?? 24 * 60 * 60;

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBodyBytes) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > maxBodyBytes) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  const verification = verifyWebhookSignature({
    rawBody,
    timestampHeader: request.headers.get("x-webhook-timestamp"),
    signatureHeader: request.headers.get("x-webhook-signature"),
    secret: dependencies.secret,
    nowSeconds: dependencies.nowSeconds,
  });

  if (!verification.ok) {
    const status = verification.reason === "server_secret_invalid" ? 500 : 401;
    return Response.json({ error: verification.reason }, { status });
  }

  const event = parseWebhookEvent(rawBody);
  if (!event) {
    return Response.json({ error: "event_invalid" }, { status: 400 });
  }

  const firstDelivery = await dependencies.idempotencyStore.reserve(
    event.id,
    idempotencyTtlSeconds,
  );
  if (!firstDelivery) {
    return Response.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    await dependencies.queue.enqueue(event);
  } catch {
    return Response.json({ error: "queue_unavailable" }, { status: 503 });
  }

  return Response.json({ received: true }, { status: 202 });
}
