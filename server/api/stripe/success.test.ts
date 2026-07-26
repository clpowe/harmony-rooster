import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const retrieveCheckout = vi.hoisted(() => vi.fn());
const getAirtableRecord = vi.hoisted(() => vi.fn());

vi.mock("#stripe/server", () => ({
  useServerStripe: vi.fn(async () => ({
    checkout: {
      sessions: {
        retrieve: retrieveCheckout,
      },
    },
  })),
}));

vi.mock("@constants/airtable", () => ({
  AIRTABLE_BASE_ID: "app_test",
  AIRTABLE_TABLE_IDS: {
    SESSIONS: "tbl_sessions",
  },
}));

vi.mock("airtable-ts", () => ({
  AirtableTs: class {
    get = getAirtableRecord;
  },
}));

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("useRuntimeConfig", (event: { config?: Record<string, unknown> }) => ({
  airtableKey: "airtable_test_key",
  ...event.config,
}));
vi.stubGlobal("getQuery", (event: { query?: Record<string, unknown> }) => event.query ?? {});
vi.stubGlobal(
  "createError",
  (input: { message: string; statusCode: number; statusMessage?: string }) =>
    Object.assign(new Error(input.message), input),
);

async function getHandler() {
  return (await import("./success")).default as unknown as (
    event: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
}

describe("GET /api/stripe/success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    retrieveCheckout.mockResolvedValue({
      amount_total: 12000,
      customer: {
        email: "private@example.com",
        name: "Private Customer",
      },
      metadata: {
        customerID: "cust_private",
        sessionID: "sess_airtable",
      },
      payment_intent: {
        payment_method: {
          card: {
            brand: "visa",
            last4: "4242",
          },
        },
      },
      payment_status: "paid",
    });
    getAirtableRecord.mockResolvedValue({
      date: "2026-05-01",
      id: "sess_airtable",
      location: "Nashville",
      "session-name": "Harmony Course",
      time: "1:00 PM",
    });
  });

  it("requires a checkout session id", async () => {
    const handler = await getHandler();

    await expect(handler({ query: {} })).rejects.toMatchObject({
      message: "Session ID is required",
      statusCode: 400,
    });
    expect(retrieveCheckout).not.toHaveBeenCalled();
  });

  it("requires Airtable configuration before retrieving checkout data", async () => {
    const handler = await getHandler();

    await expect(
      handler({
        config: { airtableKey: "" },
        query: { session_id: "cs_test_123" },
      }),
    ).rejects.toMatchObject({
      message: "Missing Airtable API key",
      statusCode: 500,
    });
    expect(retrieveCheckout).not.toHaveBeenCalled();
  });

  it("returns only UI-safe payment and course fields", async () => {
    const handler = await getHandler();

    const result = await handler({
      query: { session_id: ["cs_test_123", "cs_ignored"] },
    });

    expect(retrieveCheckout).toHaveBeenCalledWith("cs_test_123", {
      expand: ["payment_intent", "payment_intent.payment_method"],
    });
    expect(getAirtableRecord).toHaveBeenCalledWith(expect.any(Object), "sess_airtable");
    expect(result).toEqual({
      payment: {
        brand: "visa",
        last4: "4242",
      },
      session: {
        date: "2026-05-01",
        id: "sess_airtable",
        location: "Nashville",
        name: "Harmony Course",
        time: "1:00 PM",
      },
      status: "paid",
      total: 12000,
    });
    expect(result).not.toHaveProperty("customer");
    expect(JSON.stringify(result)).not.toContain("private@example.com");
    expect(JSON.stringify(result)).not.toContain("cust_private");
  });

  it("uses null placeholders when Stripe relations are not expanded or linked", async () => {
    retrieveCheckout.mockResolvedValue({
      amount_total: 12000,
      metadata: {},
      payment_intent: "pi_test_123",
      payment_status: "paid",
    });
    const handler = await getHandler();

    const result = await handler({ query: { session_id: "cs_test_123" } });

    expect(result).toEqual({
      payment: {
        brand: null,
        last4: null,
      },
      session: null,
      status: "paid",
      total: 12000,
    });
    expect(getAirtableRecord).not.toHaveBeenCalled();
  });
});
