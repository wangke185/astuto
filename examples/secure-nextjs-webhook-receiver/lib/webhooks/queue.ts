import type { WebhookEvent } from "./event";

export interface WebhookQueue {
  enqueue(event: WebhookEvent): Promise<void>;
}

/** Demo-only queue. Replace with a durable queue before production use. */
class ConsoleWebhookQueue implements WebhookQueue {
  async enqueue(event: WebhookEvent): Promise<void> {
    console.info("webhook_enqueued", { id: event.id, type: event.type });
  }
}

export const webhookQueue = new ConsoleWebhookQueue();
