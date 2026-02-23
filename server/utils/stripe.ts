import type Stripe from "stripe";
import type { StripeWebhookRegistrationEvent } from "../../shared/types/stripe-webhooks";

export function isRegistrationEvent(
  event: Stripe.Event,
): event is StripeWebhookRegistrationEvent {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return session.payment_status === "paid";
  }
  return event.type === "checkout.session.async_payment_succeeded";
}
