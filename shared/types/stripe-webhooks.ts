import type Stripe from "stripe";

export type StripeWebhookRegistrationRecord = {
  id: string;
  Name: string;
  Status: string;
  Session: string[];
  Customer: string[];
};

export type StripeWebhookRegistrationEvent =
  | Stripe.CheckoutSessionCompletedEvent
  | Stripe.CheckoutSessionAsyncPaymentSucceededEvent;

export type StripeWebhookRefundEvent =
  | Stripe.RefundCreatedEvent
  | Stripe.RefundFailedEvent
  | Stripe.RefundUpdatedEvent;
