import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const airtable = vi.hoisted(() => ({
  get: vi.fn(),
  insert: vi.fn(),
  scan: vi.fn(),
  update: vi.fn(),
}));
const stripe = vi.hoisted(() => ({
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  customers: {
    create: vi.fn(),
  },
}));

vi.mock("#stripe/server", () => ({
  useServerStripe: vi.fn(async () => stripe),
}));

vi.mock("airtable-ts", () => ({
  AirtableTs: class {
    get = airtable.get;
    insert = airtable.insert;
    scan = airtable.scan;
    update = airtable.update;
  },
}));

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("useRuntimeConfig", (event: { config?: Record<string, unknown> }) => ({
  airtableKey: "airtable_test_key",
  public: {
    siteUrl: "https://harmonyrooster.com/path",
  },
  ...event.config,
}));
vi.stubGlobal("readBody", async (event: { body: unknown }) => event.body);
vi.stubGlobal(
  "getRequestURL",
  (event: { requestUrl?: string }) =>
    new URL(event.requestUrl ?? "https://request.example.com/course/register"),
);
vi.stubGlobal(
  "createError",
  (input: { message: string; statusCode: number; statusMessage?: string }) =>
    Object.assign(new Error(input.message), input),
);
vi.stubGlobal("catchError", async <T>(promise: Promise<T>) => {
  try {
    return [undefined, await promise] as const;
  } catch (error) {
    return [error] as const;
  }
});

const validBody = {
  email: "CUSTOMER@EXAMPLE.COM",
  first_name: "Taylor",
  last_name: "Swift",
  phonenumber: "615-555-1234",
  sessionId: "sess_airtable",
};

const sessionRecord = {
  cost: [120.5],
  date: "2026-05-01",
  id: "sess_airtable",
  location: "Nashville",
  productID: ["prod_123"],
  sessionName: "Harmony Course",
  time: "1:00 PM",
};

async function getHandler() {
  return (await import("./courses.post")).default as unknown as (
    event: Record<string, unknown>,
  ) => Promise<{
    url: string;
  }>;
}

describe("POST /api/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    airtable.get.mockResolvedValue(sessionRecord);
    airtable.scan.mockResolvedValue([
      {
        email: "customer@example.com",
        first_name: "Taylor",
        id: "cust_airtable",
        last_name: "Swift",
        phone: "615-555-1234",
        stripeID: "cus_existing",
      },
    ]);
    stripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });
    stripe.customers.create.mockResolvedValue({ id: "cus_new" });
  });

  it("creates checkout for an existing customer with normalized lookup and safe redirect URLs", async () => {
    const handler = await getHandler();

    const result = await handler({ body: validBody });

    expect(result).toEqual({ url: "https://checkout.stripe.com/c/pay/cs_test_123" });
    expect(airtable.scan).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        filterByFormula: '{email}="customer@example.com"',
        maxRecords: 1,
      }),
    );
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "https://harmonyrooster.com/cancel",
        customer: "cus_existing",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              product: "prod_123",
              unit_amount: 12050,
            }),
          }),
        ],
        metadata: expect.objectContaining({
          customerID: "cust_airtable",
          sessionID: "sess_airtable",
        }),
        success_url: "https://harmonyrooster.com/success?session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("creates and persists both Airtable and Stripe customers when none exists", async () => {
    airtable.scan.mockResolvedValue([]);
    airtable.insert.mockResolvedValue({
      id: "cust_new",
      stripeID: null,
    });
    airtable.update.mockResolvedValue({
      id: "cust_new",
      stripeID: "cus_new",
    });
    const handler = await getHandler();

    await handler({ body: validBody });

    expect(airtable.insert).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        email: "customer@example.com",
        first_name: "Taylor",
      }),
    );
    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "CUSTOMER@EXAMPLE.COM",
        metadata: { sessionId: "cust_new" },
      }),
    );
    expect(airtable.update).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: "cust_new", stripeID: "cus_new" }),
    );
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_new" }),
    );
  });

  it("adds a Stripe id when an existing Airtable customer does not have one", async () => {
    airtable.scan.mockResolvedValue([{ id: "cust_airtable", stripeID: null }]);
    airtable.update.mockResolvedValue({ id: "cust_airtable", stripeID: "cus_new" });
    const handler = await getHandler();

    await handler({ body: validBody });

    expect(airtable.insert).not.toHaveBeenCalled();
    expect(stripe.customers.create).toHaveBeenCalledOnce();
    expect(airtable.update).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: "cust_airtable", stripeID: "cus_new" }),
    );
  });

  it("rejects invalid registration input before querying Airtable", async () => {
    const handler = await getHandler();

    await expect(
      handler({
        body: {
          ...validBody,
          email: "not-an-email",
        },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(airtable.get).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns a 404 when the requested Airtable session does not exist", async () => {
    airtable.get.mockRejectedValue(new Error("record missing"));
    const handler = await getHandler();

    await expect(handler({ body: validBody })).rejects.toMatchObject({
      message: "record missing",
      statusCode: 404,
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("rejects sessions without complete Stripe price configuration", async () => {
    airtable.get.mockResolvedValue({
      ...sessionRecord,
      productID: [],
    });
    const handler = await getHandler();

    await expect(handler({ body: validBody })).rejects.toMatchObject({
      message: "Session is missing Stripe product/cost configuration",
      statusCode: 500,
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("uses the request origin when the configured site URL is invalid", async () => {
    const handler = await getHandler();

    await handler({
      body: validBody,
      config: {
        public: { siteUrl: "not a URL" },
      },
      requestUrl: "https://preview.example.com/course/register",
    });

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "https://preview.example.com/cancel",
        success_url: "https://preview.example.com/success?session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("rejects a Stripe checkout session without a redirect URL", async () => {
    stripe.checkout.sessions.create.mockResolvedValue({ id: "cs_test_123", url: null });
    const handler = await getHandler();

    await expect(handler({ body: validBody })).rejects.toMatchObject({
      message: "Session URL is null",
      statusCode: 500,
    });
  });
});
