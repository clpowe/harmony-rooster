import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type Stripe from "stripe";
import {
  getFulfillmentRecordKey,
  readFulfillmentRecord,
  type CheckoutContext,
  type FulfillmentRecord,
} from "./stripe-fulfillment";
import { sendReceiptEmail, type ReceiptEmailDependencies } from "./receipt-emails";

const renderEmail = vi.hoisted(() =>
  vi.fn(
    async (
      _component: unknown,
      props: { receiptUrl?: string | null },
      options?: { plainText?: boolean },
    ) => {
      if (options?.plainText) {
        return props.receiptUrl ? `View receipt: ${props.receiptUrl}` : "Receipt email";
      }

      return props.receiptUrl
        ? `<a href="${props.receiptUrl}">View Stripe receipt</a>`
        : "<p>Receipt email</p>";
    },
  ),
);

vi.mock("@vue-email/render", () => ({
  render: renderEmail,
}));

class FakeRedis {
  readonly store = new Map<string, string>();

  readonly del = vi.fn(async (key: string) => (this.store.delete(key) ? 1 : 0));

  readonly get = vi.fn(async <T,>(key: string): Promise<T | null> => {
    const value = this.store.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  });

  readonly set = vi.fn(
    async (
      key: string,
      value: string,
      _options?: {
        ex?: number;
        nx?: boolean;
      },
    ) => {
      this.store.set(key, value);
      return "OK";
    },
  );

  seed(key: string, record: FulfillmentRecord) {
    this.store.set(key, JSON.stringify(record));
  }
}

function createCheckoutContext(
  overrides: Partial<Stripe.Checkout.Session> = {},
): CheckoutContext {
  const receiptUrl = "https://pay.stripe.com/receipts/test_receipt";
  const checkoutSession = {
    id: "cs_test_123",
    amount_total: 12000,
    currency: "usd",
    payment_intent: {
      id: "pi_test_123",
      object: "payment_intent",
      latest_charge: {
        id: "ch_test_123",
        object: "charge",
        receipt_url: receiptUrl,
      },
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;

  return {
    checkoutSession,
    customer: {
      email: "customer@example.com",
      first_name: "Taylor",
      id: "cust_airtable",
      last_name: "Swift",
      phone: "5555555555",
      stripeID: "cus_123",
    },
    internalCustomerId: "cust_airtable",
    internalSessionId: "sess_airtable",
    registrationName: "Taylor Swift - Harmony Course",
    session: {
      date: "2026-05-01",
      id: "sess_airtable",
      location: "Nashville",
      registrations: [],
      sessionName: "Harmony Course",
      spotsAvailable: 3,
      time: "1:00 PM",
    },
    stripeCustomerId: "cus_123",
  };
}

function createFulfillmentRecord(
  context: CheckoutContext,
  overrides: Partial<FulfillmentRecord> = {},
): FulfillmentRecord {
  return {
    attemptCount: 1,
    checkoutSessionId: context.checkoutSession.id,
    fulfilledAt: "2026-05-01T12:00:00.000Z",
    internalCustomerId: context.internalCustomerId,
    internalSessionId: context.internalSessionId,
    lastAttemptAt: "2026-05-01T12:00:00.000Z",
    registrationId: "reg_123",
    status: "fulfilled",
    stripeEventId: "evt_123",
    ...overrides,
  };
}

function createDependencies(config: Record<string, unknown> = {}) {
  const redis = new FakeRedis();
  const send = vi.fn().mockResolvedValue({ data: { id: "email_123" }, error: null });
  const dependencies: ReceiptEmailDependencies = {
    createAirtableClient: vi.fn(),
    getRedisClient: vi.fn(() => redis as never),
    getResendClient: vi.fn(() => ({
      emails: {
        send,
      },
    })) as never,
    getRuntimeConfig: vi.fn(
      () =>
        ({
          airtableKey: "airtable_test_key",
          contactFromEmail: "contact@harmonyrooster.com",
          resendApiKey: "re_test",
          stripeWebhookSecretKey: "whsec_test",
          ...config,
        }) as never,
    ),
    getStripeClient: vi.fn(),
  };

  return { dependencies, redis, send };
}

describe("sendReceiptEmail", () => {
  beforeEach(() => {
    renderEmail.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the email id and writes receiptSentAt on the fulfillment record", async () => {
    const context = createCheckoutContext();
    const { dependencies, redis, send } = createDependencies();
    const recordKey = getFulfillmentRecordKey(context.checkoutSession.id);
    redis.seed(recordKey, createFulfillmentRecord(context));

    const result = await sendReceiptEmail(context, "reg_123", {}, dependencies);

    expect(result).toEqual({ id: "email_123" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "contact@harmonyrooster.com",
        html: expect.stringContaining("https://pay.stripe.com/receipts/test_receipt"),
        subject: "Receipt for Harmony Course - 2026-05-01",
        text: expect.stringContaining("https://pay.stripe.com/receipts/test_receipt"),
        to: "customer@example.com",
      }),
    );

    const record = await readFulfillmentRecord(recordKey, dependencies);
    expect(record).toMatchObject({
      receiptSentAt: "2026-05-23T12:00:00.000Z",
      registrationId: "reg_123",
    });
  });

  it("returns null and does not send when the receipt was already sent", async () => {
    const context = createCheckoutContext();
    const { dependencies, redis, send } = createDependencies();
    const recordKey = getFulfillmentRecordKey(context.checkoutSession.id);
    redis.seed(
      recordKey,
      createFulfillmentRecord(context, {
        receiptSentAt: "2026-05-22T12:00:00.000Z",
      }),
    );

    const result = await sendReceiptEmail(context, "reg_123", {}, dependencies);

    expect(result).toBeNull();
    expect(send).not.toHaveBeenCalled();
    expect(dependencies.getResendClient).not.toHaveBeenCalled();
  });

  it("throws when Resend returns an error", async () => {
    const context = createCheckoutContext();
    const { dependencies, redis, send } = createDependencies();
    const recordKey = getFulfillmentRecordKey(context.checkoutSession.id);
    redis.seed(recordKey, createFulfillmentRecord(context));
    send.mockResolvedValueOnce({
      data: null,
      error: {
        message: "API down",
      },
    });

    await expect(sendReceiptEmail(context, "reg_123", {}, dependencies)).rejects.toThrow(
      "Resend error: API down",
    );
  });

  it("still sends without a receiptUrl link when payment_intent is not expanded", async () => {
    const context = createCheckoutContext({
      payment_intent: "pi_test_123",
    });
    const { dependencies, redis, send } = createDependencies();
    const recordKey = getFulfillmentRecordKey(context.checkoutSession.id);
    redis.seed(recordKey, createFulfillmentRecord(context));

    const result = await sendReceiptEmail(context, "reg_123", {}, dependencies);

    expect(result).toEqual({ id: "email_123" });
    expect(send).toHaveBeenCalledOnce();
    const payload = send.mock.calls[0][0];
    expect(payload.html).not.toContain("https://pay.stripe.com/receipts");
    expect(payload.text).not.toContain("https://pay.stripe.com/receipts");
  });

  it("throws when receipt email config is missing", async () => {
    const context = createCheckoutContext();
    const { dependencies, send } = createDependencies({
      contactFromEmail: "",
      resendApiKey: "",
    });

    await expect(sendReceiptEmail(context, "reg_123", {}, dependencies)).rejects.toThrow(
      "Receipt email dependencies not configured",
    );
    expect(send).not.toHaveBeenCalled();
  });
});
