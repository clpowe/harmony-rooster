import type Stripe from "stripe";

export type StripeWebhookSessionRecord = {
  id: string;
};

export type StripeWebhookCustomerRecord = {
  id: string;
};

export type StripeWebhookRegistrationRecord = {
  id: string;
  Name: string;
  Session: string[];
  Customer: string[];
};

export type StripeWebhookRegistrationEvent =
  | Stripe.CheckoutSessionCompletedEvent
  | Stripe.CheckoutSessionAsyncPaymentSucceededEvent
  | Stripe.CheckoutSessionAsyncPaymentFailedEvent;
