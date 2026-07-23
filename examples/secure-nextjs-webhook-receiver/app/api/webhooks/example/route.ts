import { handleWebhook } from "../../../../lib/webhooks/handler";
import { webhookQueue } from "../../../../lib/webhooks/queue";
import { idempotencyStore } from "../../../../lib/webhooks/store";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleWebhook(request, {
    secret: process.env.WEBHOOK_SECRET ?? "",
    idempotencyStore,
    queue: webhookQueue,
  });
}
