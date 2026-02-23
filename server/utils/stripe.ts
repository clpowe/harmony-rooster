import type Stripe from "stripe";
import type { StripeWebhookRegistrationEvent } from "../../shared/types/stripe-webhooks";

export function isRegistrationEvent(
  event: Stripe.Event,
): event is StripeWebhookRegistrationEvent {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    return (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
    );
  }
  return event.type === "checkout.session.async_payment_succeeded";
}
