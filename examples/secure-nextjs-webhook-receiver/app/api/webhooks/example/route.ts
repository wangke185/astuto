import { handleWebhook } from "../../../../lib/webhooks/handler";
import { webhookQueue } from "../../../../lib/webhooks/queue";
import { idempotencyStore } from "../../../../lib/webhooks/store";

export const runtime = "nodejs";

// Adapt the signing headers and algorithm to the provider's official specification.
export async function POST(request: Request): Promise<Response> {
  return handleWebhook(request, {
    secret: process.env.WEBHOOK_SECRET ?? "",
    idempotencyStore,
    queue: webhookQueue,
  });
}
