import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type Stripe from "stripe";
import {
  claimFulfillment,
  fulfillCheckout,
  getFulfillmentRecordKey,
  readFulfillmentRecord,
  type FulfillmentDependencies,
} from "./stripe-fulfillment";

class FakeRedis {
  private readonly store = new Map<string, string>();

  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set(
    key: string,
    value: string,
    options?: {
      ex?: number;
      nx?: boolean;
    },
  ) {
    void options?.ex;

    if (options?.nx && this.store.has(key)) {
      return null;
    }

    this.store.set(key, value);
    return "OK";
  }
}

class FakeAirtable {
  failInsert = false;
  registrations: Array<Record<string, unknown>> = [];
  sessions = new Map<string, Record<string, unknown>>();
  customers = new Map<string, Record<string, unknown>>();

  async get(table: { tableId: string }, id: string) {
    const source = table.tableId === "tbl1Ro2mdLntedaBm" ? this.sessions : this.customers;
    const record = source.get(id);

    if (!record) {
      throw new Error(`Missing Airtable record ${id}`);
    }

    return record;
  }

  async insert(_table: { tableId: string }, payload: Record<string, unknown>) {
    if (this.failInsert) {
      throw new Error("Airtable insert failed");
    }

    const record = {
      id: `reg_${this.registrations.length + 1}`,
      ...payload,
    };

    this.registrations.push(record);
    return record;
  }

  async update(table: { tableId: string }, payload: Record<string, unknown> & { id: string }) {
    const source = table.tableId === "tbl1Ro2mdLntedaBm" ? this.sessions : this.customers;
    const existing = source.get(payload.id);

    if (!existing) {
      throw new Error(`Missing Airtable record ${payload.id}`);
    }

    const next = {
      ...existing,
      ...payload,
    };

    source.set(payload.id, next);
    return next;
  }
}

function createCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    object: "checkout.session",
    after_expiration: null,
    allow_promotion_codes: null,
    amount_subtotal: 12000,
    amount_total: 12000,
    automatic_tax: {
      enabled: false,
      liability: null,
      provider: null,
      status: null,
    },
    billing_address_collection: null,
    cancel_url: "https://example.com/cancel",
    client_reference_id: null,
    client_secret: null,
    collected_information: {
      shipping_details: null,
    },
    consent: null,
    consent_collection: null,
    created: 0,
    currency: "usd",
    currency_conversion: null,
    custom_fields: [],
    custom_text: {
      after_submit: null,
      shipping_address: null,
      submit: null,
      terms_of_service_acceptance: null,
    },
    customer: {
      id: "cus_123",
      object: "customer",
    } as Stripe.Customer,
    customer_creation: null,
    customer_details: null,
    customer_email: "customer@example.com",
    discounts: [],
    expires_at: 0,
    invoice: null,
    invoice_creation: null,
    livemode: false,
    locale: null,
    metadata: {
      customerID: "cust_airtable",
      email: "customer@example.com",
      first_name: "Taylor",
      last_name: "Swift",
      sessionID: "sess_airtable",
    },
    mode: "payment",
    payment_intent: null,
    payment_link: null,
    payment_method_collection: "always",
    payment_method_configuration_details: null,
    payment_method_options: {},
    payment_method_types: ["card"],
    payment_status: "paid",
    permissions: null,
    phone_number_collection: {
      enabled: false,
    },
    recovered_from: null,
    saved_payment_method_options: null,
    setup_intent: null,
    shipping_address_collection: null,
    shipping_cost: null,
    shipping_details: null,
    shipping_options: [],
    status: "complete",
    submit_type: null,
    subscription: null,
    success_url: "https://example.com/success",
    total_details: {
      amount_discount: 0,
      amount_shipping: 0,
      amount_tax: 0,
    },
    ui_mode: "hosted",
    url: null,
    wallet_options: null,
    ...overrides,
  } as Stripe.Checkout.Session;
}

function createDependencies(options?: {
  airtable?: FakeAirtable;
  checkoutSession?: Stripe.Checkout.Session;
}) {
  const redis = new FakeRedis();
  const airtable = options?.airtable ?? new FakeAirtable();
  const checkoutSession = options?.checkoutSession ?? createCheckoutSession();
  const retrieve = vi.fn().mockResolvedValue(checkoutSession);

  airtable.sessions.set("sess_airtable", {
    id: "sess_airtable",
    sessionName: "Harmony Course",
    date: "2026-05-01",
    location: "Nashville",
    registrations: [],
    spotsAvailable: 3,
    time: "1:00 PM",
  });

  airtable.customers.set("cust_airtable", {
    email: "customer@example.com",
    first_name: "Taylor",
    id: "cust_airtable",
    last_name: "Swift",
    phone: "5555555555",
    stripeID: "cus_123",
  });

  const dependencies: FulfillmentDependencies = {
    createAirtableClient: () => airtable as never,
    getRedisClient: () => redis as never,
    getRuntimeConfig: () =>
      ({
        airtableKey: "airtable_test_key",
        stripeWebhookSecretKey: "whsec_test",
      }) as never,
    getStripeClient: async () =>
      ({
        checkout: {
          sessions: {
            retrieve,
          },
        },
      }) as never,
  };

  return { airtable, dependencies, redis, retrieve };
}

describe("claimFulfillment", () => {
  it("claims a checkout session the first time", async () => {
    const { dependencies } = createDependencies();

    const result = await claimFulfillment("cs_test_123", "evt_1", undefined, dependencies);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.attemptCount).toBe(1);
      expect(result.record.status).toBe("processing");
    }
  });

  it("returns in_progress when the lock is already held", async () => {
    const { dependencies } = createDependencies();

    const first = await claimFulfillment("cs_test_123", "evt_1", undefined, dependencies);
    expect(first.ok).toBe(true);

    const second = await claimFulfillment("cs_test_123", "evt_2", undefined, dependencies);

    expect(second).toMatchObject({
      ok: false,
      reason: "in_progress",
    });
  });

  it("returns already_fulfilled when the record is already fulfilled", async () => {
    const { dependencies } = createDependencies();

    await (dependencies.getRedisClient() as FakeRedis).set(
      getFulfillmentRecordKey("cs_test_123"),
      JSON.stringify({
        attemptCount: 1,
        checkoutSessionId: "cs_test_123",
        fulfilledAt: "2026-03-27T12:00:00.000Z",
        lastAttemptAt: "2026-03-27T12:00:00.000Z",
        status: "fulfilled",
        stripeEventId: "evt_1",
      }),
    );

    const result = await claimFulfillment("cs_test_123", "evt_2", undefined, dependencies);

    expect(result).toMatchObject({
      ok: false,
      reason: "already_fulfilled",
    });
  });

  it("retries a failed record and increments attemptCount", async () => {
    const { dependencies } = createDependencies();

    await (dependencies.getRedisClient() as FakeRedis).set(
      getFulfillmentRecordKey("cs_test_123"),
      JSON.stringify({
        attemptCount: 1,
        checkoutSessionId: "cs_test_123",
        failedAt: "2026-03-27T12:00:00.000Z",
        lastAttemptAt: "2026-03-27T12:00:00.000Z",
        lastError: "boom",
        status: "failed",
        stripeEventId: "evt_1",
      }),
    );

    const result = await claimFulfillment("cs_test_123", "evt_2", undefined, dependencies);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.attemptCount).toBe(2);
    }
  });
});

describe("fulfillCheckout", () => {
  let event: Record<string, never>;

  beforeEach(() => {
    event = {};
  });

  it("creates a registration once for a paid completed session", async () => {
    const { airtable, dependencies } = createDependencies();

    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);
    await fulfillCheckout("cs_test_123", "evt_2", event, dependencies);

    expect(airtable.registrations).toHaveLength(1);
    expect(airtable.sessions.get("sess_airtable")).toMatchObject({
      registrations: ["reg_1"],
    });

    const record = await readFulfillmentRecord(
      getFulfillmentRecordKey("cs_test_123"),
      dependencies,
    );

    expect(record).toMatchObject({
      attemptCount: 1,
      checkoutSessionId: "cs_test_123",
      registrationId: "reg_1",
      status: "fulfilled",
      stripeEventId: "evt_1",
    });
  });

  it("skips unpaid sessions without creating records", async () => {
    const { airtable, dependencies } = createDependencies({
      checkoutSession: createCheckoutSession({
        payment_status: "unpaid",
      }),
    });

    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);

    expect(airtable.registrations).toHaveLength(0);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toBeNull();
  });

  it("records failed state when required metadata is missing", async () => {
    const { dependencies } = createDependencies({
      checkoutSession: createCheckoutSession({
        metadata: {},
      }),
    });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /missing required fulfillment metadata/i,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      attemptCount: 1,
      status: "failed",
      stripeEventId: "evt_1",
    });
  });

  it("records failed state when the Airtable session is missing", async () => {
    const { airtable, dependencies } = createDependencies();

    airtable.sessions.delete("sess_airtable");

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Missing Airtable record sess_airtable/,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "failed",
    });
  });

  it("fails when no seats remain", async () => {
    const { airtable, dependencies } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /no seats remaining/i,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "failed",
    });
  });

  it("fails when the Stripe customer does not match Airtable", async () => {
    const { airtable, dependencies } = createDependencies();

    airtable.customers.set("cust_airtable", {
      ...airtable.customers.get("cust_airtable")!,
      stripeID: "cus_other",
    });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Stripe customer mismatch/i,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "failed",
    });
  });

  it("records failed state when Airtable registration insert fails", async () => {
    const airtable = new FakeAirtable();
    airtable.failInsert = true;
    const { dependencies } = createDependencies({ airtable });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Airtable insert failed/,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "failed",
    });
  });
});
