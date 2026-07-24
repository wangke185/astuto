export type StripeEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed";

export interface StripePaymentIntentObject {
  id: string;
  metadata?: {
    booking_id?: string;
    cal_booking_id?: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: StripePaymentIntentObject;
  };
}

export interface BookingRecord {
  id: string;
  calBookingId: string;
  status: "held" | "paid" | "payment_failed";
}

export interface BookingRepository {
  hasProcessedEvent(eventId: string): Promise<boolean>;
  getBooking(bookingId: string): Promise<BookingRecord | null>;
  markPaid(input: {
    bookingId: string;
    paymentIntentId: string;
    stripeEventId: string;
  }): Promise<void>;
  markPaymentFailed(input: {
    bookingId: string;
    paymentIntentId: string;
    stripeEventId: string;
  }): Promise<void>;
}

export interface CalendarGateway {
  confirmHold(calBookingId: string, idempotencyKey: string): Promise<void>;
  releaseHold(calBookingId: string, idempotencyKey: string): Promise<void>;
}

export type ProcessResult =
  | { status: "processed"; bookingId: string }
  | { status: "duplicate"; eventId: string };
