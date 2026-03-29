import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type Stripe from "stripe";

const fulfillCheckout = vi.fn();
const isFulfillmentCandidate = vi.fn();
const verifyStripeWebhook = vi.fn();
const logger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);

vi.mock("../../services/stripe-fulfillment", () => ({
  fulfillCheckout,
  isFulfillmentCandidate,
  verifyStripeWebhook,
}));

vi.mock("../../utils/logger", () => ({
  createRequestLogger: () => logger,
}));

describe("handleStripeWebhook", () => {
  beforeEach(() => {
    fulfillCheckout.mockReset();
    isFulfillmentCandidate.mockReset();
    verifyStripeWebhook.mockReset();
    logger.debug.mockReset();
    logger.error.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
  });

  it("returns success without fulfillment for non-candidate events", async () => {
    verifyStripeWebhook.mockResolvedValue({
      id: "evt_1",
      type: "payment_intent.succeeded",
    } as Stripe.Event);
    isFulfillmentCandidate.mockReturnValue(false);

    const { handleStripeWebhook } = await import("./webhook.post");
    const result = await handleStripeWebhook({});

    expect(result).toEqual({ received: true });
    expect(fulfillCheckout).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it("passes only the checkout session id and event id to fulfillment", async () => {
    verifyStripeWebhook.mockResolvedValue({
      data: {
        object: {
          id: "cs_test_123",
        },
      },
      id: "evt_2",
      type: "checkout.session.completed",
    } as Stripe.Event);
    isFulfillmentCandidate.mockReturnValue(true);

    const { handleStripeWebhook } = await import("./webhook.post");
    const result = await handleStripeWebhook({});

    expect(result).toEqual({ received: true });
    expect(fulfillCheckout).toHaveBeenCalledWith("cs_test_123", "evt_2", expect.any(Object));
    expect(logger.info).toHaveBeenCalledWith(
      "Stripe webhook accepted for fulfillment",
      expect.objectContaining({
        checkoutSessionId: "cs_test_123",
        eventId: "evt_2",
      }),
    );
  });
});
