export type WebhookEvent = {
  id: string;
  type: string;
  createdAt: string;
  data: unknown;
};

export function parseWebhookEvent(rawBody: string): WebhookEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;

  if (
    typeof event.id !== "string" ||
    event.id.length < 1 ||
    event.id.length > 128 ||
    typeof event.type !== "string" ||
    event.type.length < 1 ||
    event.type.length > 128 ||
    typeof event.createdAt !== "string" ||
    Number.isNaN(Date.parse(event.createdAt)) ||
    !("data" in event)
  ) {
    return null;
  }

  return {
    id: event.id,
    type: event.type,
    createdAt: event.createdAt,
    data: event.data,
  };
}
