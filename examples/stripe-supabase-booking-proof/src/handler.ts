import { processStripePaymentEvent } from "./bookingService.js";
import { verifyStripeSignature } from "./stripeSignature.js";
import type {
  BookingRepository,
  CalendarGateway,
  StripeWebhookEvent,
} from "./types.js";

export interface WebhookRequest {
  rawBody: string;
  stripeSignature: string | null;
}

export interface WebhookResponse {
  status: number;
  body: {
    received?: true;
    duplicate?: true;
    error?: string;
  };
}

export async function handleStripeWebhook(input: {
  request: WebhookRequest;
  endpointSecret: string;
  repository: BookingRepository;
  calendar: CalendarGateway;
  nowSeconds?: number;
}): Promise<WebhookResponse> {
  const { request, endpointSecret, repository, calendar, nowSeconds } = input;

  if (!request.stripeSignature) {
    return { status: 400, body: { error: "Missing Stripe-Signature header" } };
  }

  try {
    verifyStripeSignature({
      rawBody: request.rawBody,
      signatureHeader: request.stripeSignature,
      endpointSecret,
      ...(nowSeconds === undefined ? {} : { nowSeconds }),
    });

    const event = JSON.parse(request.rawBody) as StripeWebhookEvent;
    if (
      event.type !== "payment_intent.succeeded" &&
      event.type !== "payment_intent.payment_failed"
    ) {
      return { status: 200, body: { received: true } };
    }

    const result = await processStripePaymentEvent({ event, repository, calendar });
    if (result.status === "duplicate") {
      return { status: 200, body: { received: true, duplicate: true } };
    }

    return { status: 200, body: { received: true } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    return { status: 400, body: { error: message } };
  }
}
