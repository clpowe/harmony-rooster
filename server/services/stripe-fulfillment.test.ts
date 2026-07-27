import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type Stripe from "stripe";

const sendReceiptEmail = vi.hoisted(() => vi.fn(async () => ({ id: "email_123" })));

vi.mock("./receipt-emails", () => ({
  sendReceiptEmail,
}));

vi.stubGlobal(
  "getHeader",
  (event: { headers?: Record<string, string> }, name: string) => event.headers?.[name],
);
vi.stubGlobal("readRawBody", async (event: { rawBody?: string }) => event.rawBody);

import {
  claimFulfillment,
  fulfillCheckout,
  getFulfillmentRecordKey,
  isFulfillmentCandidate,
  isRefundCandidate,
  markReceiptSent,
  readFulfillmentRecord,
  reconcileRefund,
  type FulfillmentDependencies,
  verifyStripeWebhook,
} from "./stripe-fulfillment";

class FakeRedis {
  private readonly store = new Map<string, string>();
  failStatusOnce: string | null = null;

  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }

  async eval<TResult>(_script: string, keys: string[], args: unknown[]): Promise<TResult> {
    const [key] = keys;
    const [owner] = args;

    const deleted =
      key !== undefined &&
      typeof owner === "string" &&
      this.store.get(key) === owner &&
      this.store.delete(key)
        ? 1
        : 0;

    return deleted as TResult;
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

    if (!options?.nx && this.failStatusOnce) {
      const parsed = JSON.parse(value) as { status?: string };
      if (parsed.status === this.failStatusOnce) {
        this.failStatusOnce = null;
        throw new Error(`Redis write failed for ${parsed.status}`);
      }
    }

    this.store.set(key, value);
    return "OK";
  }
}

class FakeAirtable {
  failInsert = false;
  failSessionUpdateOnce = false;
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

    if (table.tableId === "tbl1Ro2mdLntedaBm" && this.failSessionUpdateOnce) {
      this.failSessionUpdateOnce = false;
      throw new Error("Airtable session update failed");
    }

    const next = {
      ...existing,
      ...payload,
    };

    source.set(payload.id, next);
    return next;
  }
}

function createDeferred() {
  let resolve!: () => void;

  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
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
    payment_intent: "pi_123",
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

function createRefund(overrides: Partial<Stripe.Refund> = {}): Stripe.Refund {
  return {
    id: "re_session_full",
    object: "refund",
    failure_reason: undefined,
    metadata: {
      checkout_session_id: "cs_test_123",
      internal_session_id: "sess_airtable",
      remediation_reason: "session_full",
    },
    payment_intent: "pi_123",
    status: "succeeded",
    ...overrides,
  } as Stripe.Refund;
}

function createDependencies(options?: {
  airtable?: FakeAirtable;
  checkoutSession?: Stripe.Checkout.Session;
  constructEvent?: ReturnType<typeof vi.fn>;
}) {
  const redis = new FakeRedis();
  const airtable = options?.airtable ?? new FakeAirtable();
  const checkoutSession = options?.checkoutSession ?? createCheckoutSession();
  const retrieve = vi.fn().mockResolvedValue(checkoutSession);
  const constructEvent = options?.constructEvent ?? vi.fn();
  const refundCreate = vi.fn(
    async (params: Stripe.RefundCreateParams, _options?: Stripe.RequestOptions) =>
      createRefund({
        metadata: (params.metadata ?? null) as Stripe.Metadata | null,
        payment_intent: params.payment_intent ?? null,
      }),
  );
  const refundList = vi.fn().mockResolvedValue({ data: [] });

  airtable.sessions.set("sess_airtable", {
    capacity: 3,
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
    getStripeClient: vi.fn(
      async () =>
        ({
          checkout: {
            sessions: {
              retrieve,
            },
          },
          refunds: {
            create: refundCreate,
            list: refundList,
          },
          webhooks: {
            constructEvent,
          },
        }) as never,
    ),
  };

  return {
    airtable,
    constructEvent,
    dependencies,
    redis,
    refundCreate,
    refundList,
    retrieve,
  };
}

beforeEach(() => {
  sendReceiptEmail.mockClear();
  sendReceiptEmail.mockResolvedValue({ id: "email_123" });
});

describe("verifyStripeWebhook", () => {
  it("rejects requests without a Stripe signature before creating a client", async () => {
    const { dependencies } = createDependencies();

    await expect(verifyStripeWebhook({ rawBody: "{}" }, dependencies)).rejects.toMatchObject({
      message: "Missing Stripe signature",
      statusCode: 400,
    });
    expect(dependencies.getStripeClient).not.toHaveBeenCalled();
  });

  it("rejects requests without a raw body", async () => {
    const { dependencies } = createDependencies();

    await expect(
      verifyStripeWebhook({ headers: { "stripe-signature": "sig_test" } }, dependencies),
    ).rejects.toMatchObject({
      message: "Missing request body",
      statusCode: 400,
    });
  });

  it("constructs the event with the raw body and configured signing secret", async () => {
    const stripeEvent = {
      id: "evt_123",
      type: "checkout.session.completed",
    } as Stripe.Event;
    const constructEvent = vi.fn().mockReturnValue(stripeEvent);
    const { dependencies } = createDependencies({ constructEvent });

    const result = await verifyStripeWebhook(
      {
        headers: { "stripe-signature": "sig_test" },
        rawBody: "raw=request-body",
      },
      dependencies,
    );

    expect(result).toBe(stripeEvent);
    expect(constructEvent).toHaveBeenCalledWith("raw=request-body", "sig_test", "whsec_test");
  });

  it("returns a safe 400 error when signature verification fails", async () => {
    const constructEvent = vi.fn(() => {
      throw new Error("signature mismatch");
    });
    const { dependencies } = createDependencies({ constructEvent });

    await expect(
      verifyStripeWebhook(
        {
          headers: { "stripe-signature": "sig_bad" },
          rawBody: "{}",
        },
        dependencies,
      ),
    ).rejects.toMatchObject({
      message: "Webhook Error: signature mismatch",
      statusCode: 400,
    });
  });
});

describe("isFulfillmentCandidate", () => {
  it.each(["checkout.session.completed", "checkout.session.async_payment_succeeded"])(
    "accepts %s",
    (type) => {
      expect(isFulfillmentCandidate({ type } as Stripe.Event)).toBe(true);
    },
  );

  it.each(["checkout.session.async_payment_failed", "payment_intent.succeeded"])(
    "ignores %s",
    (type) => {
      expect(isFulfillmentCandidate({ type } as Stripe.Event)).toBe(false);
    },
  );
});

describe("isRefundCandidate", () => {
  it.each(["refund.created", "refund.updated", "refund.failed"])("accepts %s", (type) => {
    expect(isRefundCandidate({ type } as Stripe.Event)).toBe(true);
  });

  it("ignores unrelated events", () => {
    expect(isRefundCandidate({ type: "charge.refunded" } as Stripe.Event)).toBe(false);
  });
});

describe("claimFulfillment", () => {
  it("claims a checkout session the first time", async () => {
    const { dependencies } = createDependencies();

    const result = await claimFulfillment(
      "cs_test_123",
      "evt_1",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.attemptCount).toBe(1);
      expect(result.record.status).toBe("processing");
    }
  });

  it("returns in_progress when the lock is already held", async () => {
    const { dependencies } = createDependencies();

    const first = await claimFulfillment(
      "cs_test_123",
      "evt_1",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );
    expect(first.ok).toBe(true);

    const second = await claimFulfillment(
      "cs_test_123",
      "evt_2",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );

    expect(second).toMatchObject({
      ok: false,
      reason: "in_progress",
    });
  });

  it("blocks different Checkout Sessions targeting the same course session", async () => {
    const { dependencies } = createDependencies();

    const metadata = {
      internalSessionId: "sess_airtable",
    };

    const first = await claimFulfillment("cs_first", "evt_first", metadata, dependencies);

    const second = await claimFulfillment("cs_second", "evt_second", metadata, dependencies);

    expect(first.ok).toBe(true);
    expect(second).toMatchObject({
      ok: false,
      reason: "in_progress",
    });
  });

  it("returns already_handled when the record is already fulfilled", async () => {
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

    const result = await claimFulfillment(
      "cs_test_123",
      "evt_2",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );

    expect(result).toMatchObject({
      ok: false,
      reason: "already_handled",
    });
  });

  it.each(["refund_pending", "refunded", "refund_failed", "manual_review"] as const)(
    "returns already_handled when remediation is %s",
    async (status) => {
      const { dependencies } = createDependencies();

      await (dependencies.getRedisClient() as FakeRedis).set(
        getFulfillmentRecordKey("cs_test_123"),
        JSON.stringify({
          attemptCount: 1,
          checkoutSessionId: "cs_test_123",
          failureCode: "session_full",
          lastAttemptAt: "2026-03-27T12:00:00.000Z",
          refundId: "re_session_full",
          status,
          stripeEventId: "evt_1",
        }),
      );

      const result = await claimFulfillment(
        "cs_test_123",
        "evt_2",
        { internalSessionId: "sess_airtable" },
        dependencies,
      );

      expect(result).toMatchObject({
        ok: false,
        reason: "already_handled",
      });
    },
  );

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

    const result = await claimFulfillment(
      "cs_test_123",
      "evt_2",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.attemptCount).toBe(2);
    }
  });
});

describe("markReceiptSent", () => {
  it("adds a timestamp while preserving the fulfillment record", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T12:00:00.000Z"));
    const { dependencies } = createDependencies();

    try {
      await claimFulfillment(
        "cs_test_123",
        "evt_1",
        { internalSessionId: "sess_airtable" },
        dependencies,
      );
      await markReceiptSent("cs_test_123", dependencies);

      expect(
        await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
      ).toMatchObject({
        attemptCount: 1,
        receiptSentAt: "2026-05-23T12:00:00.000Z",
        status: "processing",
        stripeEventId: "evt_1",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("is a no-op when no fulfillment record exists", async () => {
    const { dependencies } = createDependencies();

    await expect(markReceiptSent("cs_missing", dependencies)).resolves.toBeUndefined();
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_missing"), dependencies),
    ).toBeNull();
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
      receiptSentAt: expect.any(String),
      registrationId: "reg_1",
      status: "fulfilled",
      stripeEventId: "evt_1",
    });
    expect(sendReceiptEmail).toHaveBeenCalledOnce();
  });

  it("serializes different paid checkouts competing for the final seat", async () => {
    const firstInsertStarted = createDeferred();
    const releaseFirstInsert = createDeferred();
    const airtable = new FakeAirtable();
    const { dependencies, refundCreate, retrieve } = createDependencies({ airtable });

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      capacity: 1,
      registrations: [],
      spotsAvailable: 1,
    });

    airtable.customers.set("cust_second", {
      email: "second@example.com",
      first_name: "Jordan",
      id: "cust_second",
      last_name: "Lee",
      phone: "5555550102",
      stripeID: "cus_second",
    });

    const checkoutSessions = new Map([
      [
        "cs_first",
        createCheckoutSession({
          id: "cs_first",
          payment_intent: "pi_first",
        }),
      ],
      [
        "cs_second",
        createCheckoutSession({
          id: "cs_second",
          customer: {
            id: "cus_second",
            object: "customer",
          } as Stripe.Customer,
          customer_email: "second@example.com",
          metadata: {
            customerID: "cust_second",
            email: "second@example.com",
            first_name: "Jordan",
            last_name: "Lee",
            sessionID: "sess_airtable",
          },
          payment_intent: "pi_second",
        }),
      ],
    ]);

    retrieve.mockImplementation(async (checkoutSessionId: string) => {
      const checkoutSession = checkoutSessions.get(checkoutSessionId);

      if (!checkoutSession) {
        throw new Error(`Unexpected Checkout Session ${checkoutSessionId}`);
      }

      return checkoutSession;
    });

    const getSpy = vi.spyOn(airtable, "get");
    const originalInsert = airtable.insert.bind(airtable);
    let insertCount = 0;

    const insertSpy = vi.spyOn(airtable, "insert").mockImplementation(async (table, payload) => {
      insertCount += 1;

      if (insertCount === 1) {
        firstInsertStarted.resolve();
        await releaseFirstInsert.promise;
      }

      return originalInsert(table, payload);
    });

    const firstAttempt = fulfillCheckout("cs_first", "evt_first", event, dependencies);

    await firstInsertStarted.promise;

    const secondOutcome = await fulfillCheckout(
      "cs_second",
      "evt_second",
      event,
      dependencies,
    ).then(
      () => ({ error: null, status: "resolved" as const }),
      (error: unknown) => ({ error, status: "rejected" as const }),
    );

    const getCallsWhileLocked = getSpy.mock.calls.length;
    const insertCallsWhileLocked = insertSpy.mock.calls.length;

    expect(secondOutcome).toMatchObject({
      error: {
        statusCode: 503,
      },
      status: "rejected",
    });
    expect(getCallsWhileLocked).toBe(2);
    expect(insertCallsWhileLocked).toBe(1);
    expect(refundCreate).not.toHaveBeenCalled();
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_second"), dependencies),
    ).toBeNull();

    releaseFirstInsert.resolve();
    await firstAttempt;

    await expect(
      fulfillCheckout("cs_second", "evt_second_retry", event, dependencies),
    ).resolves.toBeUndefined();
    await expect(
      fulfillCheckout("cs_second", "evt_second_duplicate", event, dependencies),
    ).resolves.toBeUndefined();

    expect(airtable.registrations).toHaveLength(1);
    expect(airtable.sessions.get("sess_airtable")).toMatchObject({
      registrations: ["reg_1"],
    });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_first"), dependencies),
    ).toMatchObject({
      checkoutSessionId: "cs_first",
      registrationId: "reg_1",
      status: "fulfilled",
    });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_second"), dependencies),
    ).toMatchObject({
      checkoutSessionId: "cs_second",
      internalSessionId: "sess_airtable",
      paymentIntentId: "pi_second",
      refundId: "re_session_full",
      refundStatus: "succeeded",
      refundedAt: expect.any(String),
      status: "refunded",
    });
    expect(refundCreate).toHaveBeenCalledTimes(1);
    expect(refundCreate).toHaveBeenCalledWith(
      {
        metadata: {
          checkout_session_id: "cs_second",
          internal_session_id: "sess_airtable",
          remediation_reason: "session_full",
        },
        payment_intent: "pi_second",
      },
      {
        idempotencyKey: "stripe:fulfillment-refund:session-full:cs_second",
      },
    );
    expect(sendReceiptEmail).toHaveBeenCalledOnce();
  });

  it("keeps a successful registration fulfilled when receipt delivery fails", async () => {
    sendReceiptEmail.mockRejectedValueOnce(new Error("Resend unavailable"));
    const { airtable, dependencies } = createDependencies();

    await expect(
      fulfillCheckout("cs_test_123", "evt_1", event, dependencies),
    ).resolves.toBeUndefined();

    expect(airtable.registrations).toHaveLength(1);
    const record = await readFulfillmentRecord(
      getFulfillmentRecordKey("cs_test_123"),
      dependencies,
    );
    expect(record).toMatchObject({
      registrationId: "reg_1",
      status: "fulfilled",
    });
    expect(record).not.toHaveProperty("receiptSentAt");
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

  it("refunds a paid checkout when no seats remain", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });

    await expect(
      fulfillCheckout("cs_test_123", "evt_1", event, dependencies),
    ).resolves.toBeUndefined();

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      failureCode: "session_full",
      paymentIntentId: "pi_123",
      refundId: "re_session_full",
      refundStatus: "succeeded",
      refundedAt: expect.any(String),
      status: "refunded",
    });
    expect(airtable.registrations).toHaveLength(0);
    expect(refundCreate).toHaveBeenCalledOnce();
  });

  it("requires manual review when a retry cannot rule out an earlier registration", async () => {
    const { airtable, dependencies, redis, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      registrations: ["reg_unknown"],
      spotsAvailable: 0,
    });
    await redis.set(
      getFulfillmentRecordKey("cs_test_123"),
      JSON.stringify({
        attemptCount: 1,
        checkoutSessionId: "cs_test_123",
        internalCustomerId: "cust_airtable",
        internalSessionId: "sess_airtable",
        lastAttemptAt: "2026-05-23T12:00:00.000Z",
        status: "processing",
        stripeEventId: "evt_interrupted",
      }),
    );

    await expect(
      fulfillCheckout("cs_test_123", "evt_retry", event, dependencies),
    ).resolves.toBeUndefined();

    expect(refundCreate).not.toHaveBeenCalled();
    expect(airtable.registrations).toHaveLength(0);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      attemptCount: 2,
      failureCode: "session_full",
      manualReviewAt: expect.any(String),
      status: "manual_review",
    });
  });

  it("retries a transient refund error without returning to registration", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockRejectedValueOnce(new Error("Stripe connection reset"));

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Stripe connection reset/,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      failureCode: "session_full",
      lastError: "Stripe connection reset",
      status: "refund_required",
    });

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 1,
    });

    await expect(
      fulfillCheckout("cs_test_123", "evt_2", event, dependencies),
    ).resolves.toBeUndefined();

    expect(airtable.registrations).toHaveLength(0);
    expect(refundCreate).toHaveBeenCalledTimes(2);
    expect(refundCreate.mock.calls[0]).toEqual(refundCreate.mock.calls[1]);
    expect(refundCreate.mock.calls[1]?.[1]).toEqual({
      idempotencyKey: "stripe:fulfillment-refund:session-full:cs_test_123",
    });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      attemptCount: 2,
      refundId: "re_session_full",
      status: "refunded",
    });
  });

  it("does not call Stripe when refund intent cannot be persisted", async () => {
    const { airtable, dependencies, redis, refundCreate, refundList } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    redis.failStatusOnce = "refund_required";

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Redis write failed for refund_required/,
    );

    expect(refundList).not.toHaveBeenCalled();
    expect(refundCreate).not.toHaveBeenCalled();
  });

  it("reconciles an existing refund when the final Redis write failed", async () => {
    const { airtable, dependencies, redis, refundCreate, refundList } = createDependencies();
    const refund = createRefund();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(refund);
    refundList.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [refund] });
    redis.failStatusOnce = "refunded";

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Redis write failed for refunded/,
    );
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "refund_required",
    });

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 1,
    });
    await expect(
      fulfillCheckout("cs_test_123", "evt_2", event, dependencies),
    ).resolves.toBeUndefined();

    expect(refundCreate).toHaveBeenCalledOnce();
    expect(airtable.registrations).toHaveLength(0);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      refundId: "re_session_full",
      status: "refunded",
    });
  });

  it("retries refund remediation when the PaymentIntent is temporarily missing", async () => {
    const checkoutWithoutPaymentIntent = createCheckoutSession({ payment_intent: null });
    const { airtable, dependencies, refundCreate, refundList, retrieve } = createDependencies({
      checkoutSession: checkoutWithoutPaymentIntent,
    });
    retrieve
      .mockResolvedValueOnce(checkoutWithoutPaymentIntent)
      .mockResolvedValueOnce(createCheckoutSession());

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /missing a PaymentIntent/i,
    );
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      failureCode: "session_full",
      status: "refund_required",
    });

    await expect(
      fulfillCheckout("cs_test_123", "evt_2", event, dependencies),
    ).resolves.toBeUndefined();

    expect(refundList).toHaveBeenCalledOnce();
    expect(refundCreate).toHaveBeenCalledOnce();
    expect(airtable.registrations).toHaveLength(0);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      failureCode: "session_full",
      refundId: "re_session_full",
      status: "refunded",
    });
  });

  it("reconciles a pending refund to its terminal webhook status", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();
    const pendingRefund = createRefund({ status: "pending" });

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(pendingRefund);

    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      refundId: "re_session_full",
      refundStatus: "pending",
      status: "refund_pending",
    });

    await expect(
      reconcileRefund(
        createRefund({ status: "succeeded" }),
        "evt_refund_succeeded",
        event,
        dependencies,
      ),
    ).resolves.toBe(true);
    await expect(
      reconcileRefund(pendingRefund, "evt_refund_stale", event, dependencies),
    ).resolves.toBe(true);

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      refundEventId: "evt_refund_succeeded",
      refundStatus: "succeeded",
      status: "refunded",
    });
  });

  it("serializes refund webhooks with course-session fulfillment", async () => {
    const { airtable, dependencies, redis, refundCreate } = createDependencies();
    const pendingRefund = createRefund({ status: "pending" });

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(pendingRefund);
    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);

    const blockingClaim = await claimFulfillment(
      "cs_blocking",
      "evt_blocking",
      { internalSessionId: "sess_airtable" },
      dependencies,
    );
    expect(blockingClaim.ok).toBe(true);

    await expect(
      reconcileRefund(
        createRefund({ status: "succeeded" }),
        "evt_refund_succeeded",
        event,
        dependencies,
      ),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({ status: "refund_pending" });

    if (!blockingClaim.ok) {
      throw new Error("Expected the blocking claim to hold the session lock");
    }
    await redis.eval("", [blockingClaim.lockKey], [blockingClaim.lockToken]);

    await expect(
      reconcileRefund(
        createRefund({ status: "succeeded" }),
        "evt_refund_succeeded_retry",
        event,
        dependencies,
      ),
    ).resolves.toBe(true);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({ status: "refunded" });
  });

  it("rejects refund events for a different PaymentIntent", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(createRefund({ status: "pending" }));
    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);

    await expect(
      reconcileRefund(
        createRefund({ payment_intent: "pi_other", status: "succeeded" }),
        "evt_wrong_payment_intent",
        event,
        dependencies,
      ),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/stored PaymentIntent/i),
      statusCode: 409,
    });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      paymentIntentId: "pi_123",
      status: "refund_pending",
    });
  });

  it("keeps a known failed refund in manual-review state", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(
      createRefund({
        failure_reason: "insufficient_funds",
        status: "failed",
      }),
    );

    await expect(
      fulfillCheckout("cs_test_123", "evt_1", event, dependencies),
    ).resolves.toBeUndefined();
    await expect(
      fulfillCheckout("cs_test_123", "evt_2", event, dependencies),
    ).resolves.toBeUndefined();

    expect(refundCreate).toHaveBeenCalledOnce();
    expect(airtable.registrations).toHaveLength(0);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      lastError: "insufficient_funds",
      refundFailedAt: expect.any(String),
      refundId: "re_session_full",
      refundStatus: "failed",
      status: "refund_failed",
    });
  });

  it("accepts a replacement refund after a known failed attempt", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

    airtable.sessions.set("sess_airtable", {
      ...airtable.sessions.get("sess_airtable")!,
      spotsAvailable: 0,
    });
    refundCreate.mockResolvedValueOnce(
      createRefund({
        id: "re_failed",
        failure_reason: "insufficient_funds",
        status: "failed",
      }),
    );
    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);

    await expect(
      reconcileRefund(
        createRefund({ id: "re_replacement", status: "succeeded" }),
        "evt_refund_replacement",
        event,
        dependencies,
      ),
    ).resolves.toBe(true);

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      refundAttemptIds: ["re_failed", "re_replacement"],
      refundId: "re_replacement",
      refundStatus: "succeeded",
      status: "refunded",
    });
  });

  it("does not let a refund webhook replace a fulfilled registration", async () => {
    const { airtable, dependencies } = createDependencies();

    await fulfillCheckout("cs_test_123", "evt_1", event, dependencies);

    await expect(
      reconcileRefund(
        createRefund({ status: "succeeded" }),
        "evt_unexpected_refund",
        event,
        dependencies,
      ),
    ).resolves.toBe(false);

    expect(airtable.registrations).toHaveLength(1);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      registrationId: "reg_1",
      status: "fulfilled",
    });
  });

  it("fails when the Stripe customer does not match Airtable", async () => {
    const { airtable, dependencies, refundCreate } = createDependencies();

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
    expect(refundCreate).not.toHaveBeenCalled();
  });

  it("records failed state when Airtable registration insert fails", async () => {
    const airtable = new FakeAirtable();
    airtable.failInsert = true;
    const { dependencies, refundCreate } = createDependencies({ airtable });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Airtable insert failed/,
    );

    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      status: "failed",
    });
    expect(refundCreate).not.toHaveBeenCalled();
  });

  it("reuses the persisted registration when session update fails then retries", async () => {
    const airtable = new FakeAirtable();
    airtable.failSessionUpdateOnce = true;
    const { dependencies } = createDependencies({ airtable });

    await expect(fulfillCheckout("cs_test_123", "evt_1", event, dependencies)).rejects.toThrow(
      /Airtable session update failed/,
    );

    expect(airtable.registrations).toHaveLength(1);
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      registrationId: "reg_1",
      status: "failed",
    });

    await fulfillCheckout("cs_test_123", "evt_2", event, dependencies);

    expect(airtable.registrations).toHaveLength(1);
    expect(airtable.sessions.get("sess_airtable")).toMatchObject({
      registrations: ["reg_1"],
    });
    expect(
      await readFulfillmentRecord(getFulfillmentRecordKey("cs_test_123"), dependencies),
    ).toMatchObject({
      registrationId: "reg_1",
      status: "fulfilled",
      stripeEventId: "evt_2",
    });
  });
});
