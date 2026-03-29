import {
  fulfillCheckout,
  isFulfillmentCandidate,
  verifyStripeWebhook,
} from "../../services/stripe-fulfillment";
import { createRequestLogger } from "../../utils/logger";

export async function handleStripeWebhook(event: any) {
  const logger = createRequestLogger(event, {
    defaults: {
      operation: "stripe-webhook.handle",
      source: "stripe-webhook",
    },
  });

  logger.info("Stripe webhook received");

  const stripeEvent = await verifyStripeWebhook(event);
  logger.info("Stripe webhook verified", {
    eventId: stripeEvent.id,
    eventType: stripeEvent.type,
  });

  if (!isFulfillmentCandidate(stripeEvent)) {
    logger.info("Stripe webhook ignored: non-fulfillment event", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    });
    return { received: true };
  }

  logger.info("Stripe webhook accepted for fulfillment", {
    checkoutSessionId: stripeEvent.data.object.id,
    eventId: stripeEvent.id,
    eventType: stripeEvent.type,
  });
  await fulfillCheckout(stripeEvent.data.object.id, stripeEvent.id, event);
  logger.info("Stripe webhook fulfillment completed", {
    checkoutSessionId: stripeEvent.data.object.id,
    eventId: stripeEvent.id,
  });

  return { received: true };
}

export default defineEventHandler(handleStripeWebhook);
