import type {
  BookingRepository,
  CalendarGateway,
  ProcessResult,
  StripeWebhookEvent,
} from "./types.js";

function requireMetadata(event: StripeWebhookEvent): {
  bookingId: string;
  calBookingId: string;
} {
  const bookingId = event.data.object.metadata?.booking_id;
  const calBookingId = event.data.object.metadata?.cal_booking_id;

  if (!bookingId || !calBookingId) {
    throw new Error("Stripe payment intent metadata must include booking_id and cal_booking_id");
  }

  return { bookingId, calBookingId };
}

export async function processStripePaymentEvent(input: {
  event: StripeWebhookEvent;
  repository: BookingRepository;
  calendar: CalendarGateway;
}): Promise<ProcessResult> {
  const { event, repository, calendar } = input;

  if (await repository.hasProcessedEvent(event.id)) {
    return { status: "duplicate", eventId: event.id };
  }

  const { bookingId, calBookingId } = requireMetadata(event);
  const booking = await repository.getBooking(bookingId);

  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  if (booking.calBookingId !== calBookingId) {
    throw new Error("Calendar booking metadata does not match the stored booking");
  }

  if (event.type === "payment_intent.succeeded") {
    await calendar.confirmHold(calBookingId, event.id);
    await repository.markPaid({
      bookingId,
      paymentIntentId: event.data.object.id,
      stripeEventId: event.id,
    });

    return { status: "processed", bookingId };
  }

  await calendar.releaseHold(calBookingId, event.id);
  await repository.markPaymentFailed({
    bookingId,
    paymentIntentId: event.data.object.id,
    stripeEventId: event.id,
  });

  return { status: "processed", bookingId };
}
