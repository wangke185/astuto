import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { handleStripeWebhook } from "../src/handler.js";
import type {
  BookingRecord,
  BookingRepository,
  CalendarGateway,
  StripeWebhookEvent,
} from "../src/types.js";

class MemoryRepository implements BookingRepository {
  readonly processed = new Set<string>();
  readonly bookings = new Map<string, BookingRecord>([
    ["booking-1", { id: "booking-1", calBookingId: "cal-1", status: "held" }],
  ]);
  paidCalls = 0;
  failedCalls = 0;

  async hasProcessedEvent(eventId: string): Promise<boolean> {
    return this.processed.has(eventId);
  }

  async getBooking(bookingId: string): Promise<BookingRecord | null> {
    return this.bookings.get(bookingId) ?? null;
  }

  async markPaid(input: {
    bookingId: string;
    paymentIntentId: string;
    stripeEventId: string;
  }): Promise<void> {
    this.paidCalls += 1;
    const booking = this.bookings.get(input.bookingId);
    if (!booking) throw new Error("missing booking");
    booking.status = "paid";
    this.processed.add(input.stripeEventId);
  }

  async markPaymentFailed(input: {
    bookingId: string;
    paymentIntentId: string;
    stripeEventId: string;
  }): Promise<void> {
    this.failedCalls += 1;
    const booking = this.bookings.get(input.bookingId);
    if (!booking) throw new Error("missing booking");
    booking.status = "payment_failed";
    this.processed.add(input.stripeEventId);
  }
}

class CalendarSpy implements CalendarGateway {
  confirmCalls: Array<{ id: string; key: string }> = [];
  releaseCalls: Array<{ id: string; key: string }> = [];
  failNextConfirm = false;

  async confirmHold(calBookingId: string, idempotencyKey: string): Promise<void> {
    if (this.failNextConfirm) {
      this.failNextConfirm = false;
      throw new Error("calendar temporarily unavailable");
    }
    this.confirmCalls.push({ id: calBookingId, key: idempotencyKey });
  }

  async releaseHold(calBookingId: string, idempotencyKey: string): Promise<void> {
    this.releaseCalls.push({ id: calBookingId, key: idempotencyKey });
  }
}

const secret = "whsec_test_secret";
const now = 1_800_000_000;

function event(type: StripeWebhookEvent["type"], overrides: Partial<StripeWebhookEvent> = {}): StripeWebhookEvent {
  return {
    id: type === "payment_intent.succeeded" ? "evt_success" : "evt_failure",
    type,
    data: {
      object: {
        id: "pi_123",
        metadata: {
          booking_id: "booking-1",
          cal_booking_id: "cal-1",
        },
      },
    },
    ...overrides,
  };
}

function signedRequest(payload: StripeWebhookEvent, timestamp = now) {
  const rawBody = JSON.stringify(payload);
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return {
    rawBody,
    stripeSignature: `t=${timestamp},v1=${signature}`,
  };
}

test("processes a valid payment success exactly once", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const request = signedRequest(event("payment_intent.succeeded"));

  const first = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });
  const second = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(first.status, 200);
  assert.deepEqual(second.body, { received: true, duplicate: true });
  assert.equal(calendar.confirmCalls.length, 1);
  assert.equal(repository.paidCalls, 1);
  assert.equal(repository.bookings.get("booking-1")?.status, "paid");
});

test("releases the held slot when payment fails", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const request = signedRequest(event("payment_intent.payment_failed"));

  const response = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calendar.releaseCalls, [{ id: "cal-1", key: "evt_failure" }]);
  assert.equal(repository.failedCalls, 1);
  assert.equal(repository.bookings.get("booking-1")?.status, "payment_failed");
});

test("rejects an invalid signature", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const request = signedRequest(event("payment_intent.succeeded"));
  request.stripeSignature = `t=${now},v1=${"0".repeat(64)}`;

  const response = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error ?? "", /Invalid Stripe webhook signature/);
  assert.equal(calendar.confirmCalls.length, 0);
});

test("rejects a replayed webhook outside the timestamp window", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const request = signedRequest(event("payment_intent.succeeded"), now - 301);

  const response = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error ?? "", /outside the replay window/);
});

test("requires booking and calendar metadata", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const payload = event("payment_intent.succeeded");
  payload.data.object.metadata = { booking_id: "booking-1" };

  const response = await handleStripeWebhook({
    request: signedRequest(payload),
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error ?? "", /must include booking_id and cal_booking_id/);
});

test("rejects calendar identifiers that do not match stored state", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const payload = event("payment_intent.succeeded");
  payload.data.object.metadata = {
    booking_id: "booking-1",
    cal_booking_id: "cal-other",
  };

  const response = await handleStripeWebhook({
    request: signedRequest(payload),
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error ?? "", /does not match/);
});

test("does not mark an event processed when calendar confirmation fails", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  calendar.failNextConfirm = true;
  const request = signedRequest(event("payment_intent.succeeded"));

  const failed = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });
  const retried = await handleStripeWebhook({
    request,
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(failed.status, 400);
  assert.equal(repository.processed.has("evt_success"), true);
  assert.equal(retried.status, 200);
  assert.equal(repository.paidCalls, 1);
});

test("acknowledges unrelated Stripe event types without side effects", async () => {
  const repository = new MemoryRepository();
  const calendar = new CalendarSpy();
  const payload = event("payment_intent.succeeded") as StripeWebhookEvent & { type: string };
  payload.type = "customer.created";

  const response = await handleStripeWebhook({
    request: signedRequest(payload as StripeWebhookEvent),
    endpointSecret: secret,
    repository,
    calendar,
    nowSeconds: now,
  });

  assert.equal(response.status, 200);
  assert.equal(repository.paidCalls, 0);
  assert.equal(calendar.confirmCalls.length, 0);
});
