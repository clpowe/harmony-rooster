import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type Stripe from "stripe";
import type { H3Event } from "h3";
import type { FulfillmentRecord } from "./stripe-fulfillment";
import {
  issueReceiptAccess,
  loadRegistrationOutcome,
  type RegistrationOutcomeDependencies,
} from "./registration-outcome";

const event = {} as H3Event;
const now = Date.parse("2026-09-12T12:00:00Z");
let access: ReturnType<typeof issueReceiptAccess>;
let checkout: Stripe.Checkout.Session;
let record: FulfillmentRecord;
let deps: RegistrationOutcomeDependencies;
const load = () => loadRegistrationOutcome("cs_test_123", access.token, event, deps);

beforeEach(() => {
  access = issueReceiptAccess();
  checkout = {
    id: "cs_test_123",
    created: now / 1000,
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    amount_total: 12000,
    currency: "usd",
    metadata: {
      receipt_token_hash: access.tokenHash,
      sessionID: "course_1",
      customerID: "customer_1",
      email: "private@example.com",
    },
    payment_intent: { payment_method: { card: { brand: "visa", last4: "4242" } } },
  } as unknown as Stripe.Checkout.Session;
  record = {
    checkoutSessionId: checkout.id,
    internalSessionId: "course_1",
    internalCustomerId: "customer_1",
    status: "fulfilled",
    registrationId: "reg_1",
    attemptCount: 1,
    stripeEventId: "evt_1",
    lastAttemptAt: "now",
  };
  deps = {
    retrieveCheckout: vi.fn(async () => checkout),
    readFulfillment: vi.fn(async () => record),
    loadCourse: vi.fn(async () => ({
      id: "course_1",
      name: "Course",
      date: "2026-10-01",
      time: "10:00",
      location: "Nashville",
      privateField: "secret",
    })),
    now: () => now,
  };
});

describe("registration outcome", () => {
  it.each([
    ["processing", "confirming"],
    ["fulfilled", "confirmed"],
    ["failed", "needs_attention"],
    ["refund_required", "refund_pending"],
    ["refund_pending", "refund_pending"],
    ["refunded", "refunded"],
    ["refund_failed", "needs_attention"],
    ["manual_review", "needs_attention"],
  ] as const)("interprets %s as %s", async (status, expected) => {
    record.status = status;
    expect((await load()).registration.state).toBe(expected);
  });
  it("returns only receipt fields and verified registration confirmation", async () => {
    const result = await load();
    expect(result.registration.state).toBe("confirmed");
    expect(result.payment).toEqual({
      status: "paid",
      total: 12000,
      currency: "usd",
      brand: "visa",
      last4: "4242",
    });
    expect(result.session).toEqual({
      id: "course_1",
      name: "Course",
      date: "2026-10-01",
      time: "10:00",
      location: "Nashville",
    });
    for (const privateValue of [
      "private@example.com",
      access.token,
      access.tokenHash,
      "customer_1",
      "secret",
    ]) {
      expect(JSON.stringify(result)).not.toContain(privateValue);
    }
  });
  it("allows the webhook time to arrive without promising a seat", async () => {
    deps.readFulfillment = vi.fn(async () => null);
    expect((await load()).registration).toMatchObject({ state: "confirming", canRefresh: true });
    checkout.created -= 600;
    expect((await load()).registration).toMatchObject({ state: "unavailable", canRefresh: false });
  });
  it("allows confirmation time after a delayed payment on an older Checkout", async () => {
    deps.readFulfillment = vi.fn(async () => null);
    checkout.created -= 24 * 60 * 60;
    checkout.payment_intent = {
      latest_charge: { created: now / 1000, refunded: false, amount_refunded: 0 },
    } as unknown as Stripe.PaymentIntent;
    expect((await load()).registration.state).toBe("confirming");
  });
  it("keeps payment details when the ledger is unavailable", async () => {
    deps.readFulfillment = vi.fn().mockRejectedValue(new Error("Redis down"));
    const result = await load();
    expect(result.registration.state).toBe("unavailable");
    expect(result.payment.total).toBe(12000);
  });
  it("retains the outcome when course details cannot load", async () => {
    deps.loadCourse = vi.fn().mockRejectedValue(new Error("Airtable down"));
    expect(await load()).toMatchObject({ registration: { state: "confirmed" }, session: null });
  });
  it("does not confirm unpaid or expired checkouts", async () => {
    checkout.payment_status = "unpaid";
    expect((await load()).registration.state).toBe("payment_pending");
    checkout.status = "expired";
    expect((await load()).registration.state).toBe("payment_incomplete");
  });
  it("does not confirm an incomplete or unlinked fulfilled record", async () => {
    delete record.registrationId;
    expect((await load()).registration.state).toBe("unavailable");
    record.registrationId = "reg_1";
    checkout.status = "open";
    expect((await load()).registration.state).toBe("unavailable");
  });
  it.each(["checkoutSessionId", "internalSessionId", "internalCustomerId"] as const)(
    "rejects a mismatched %s",
    async (field) => {
      record[field] = "wrong";
      expect((await load()).registration.state).toBe("unavailable");
    },
  );
  it("recognizes a Stripe refund even if the registration ledger still says fulfilled", async () => {
    checkout.payment_intent = {
      latest_charge: { refunded: true, amount_refunded: 12000 },
    } as unknown as Stripe.PaymentIntent;
    expect((await load()).registration.state).toBe("refunded");
    checkout.payment_intent = {
      latest_charge: { refunded: false, amount_refunded: 1000 },
    } as unknown as Stripe.PaymentIntent;
    expect((await load()).registration.state).toBe("needs_attention");
  });
  it("rejects missing tokens before any remote lookup", async () => {
    await expect(loadRegistrationOutcome(checkout.id, "", event, deps)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(deps.retrieveCheckout).not.toHaveBeenCalled();
  });
  it("rejects a token for another Checkout before reading course or fulfillment", async () => {
    access.token = issueReceiptAccess().token;
    await expect(load()).rejects.toMatchObject({ statusCode: 403 });
    expect(deps.readFulfillment).not.toHaveBeenCalled();
    expect(deps.loadCourse).not.toHaveBeenCalled();
  });
  it("requires the stored hash and rejects changed/malformed hashes", async () => {
    for (const hash of [undefined, "", "zz".repeat(32), issueReceiptAccess().tokenHash]) {
      checkout.metadata = { ...checkout.metadata, receipt_token_hash: hash! };
      await expect(load()).rejects.toMatchObject({ statusCode: 403 });
    }
  });
  it("does not disclose Stripe errors or unknown session existence", async () => {
    deps.retrieveCheckout = vi.fn().mockRejectedValue({ code: "resource_missing" });
    await expect(load()).rejects.toMatchObject({
      statusCode: 403,
      message: "A valid receipt link is required",
    });
    deps.retrieveCheckout = vi.fn().mockRejectedValue(new Error("sensitive upstream payload"));
    await expect(load()).rejects.toMatchObject({
      statusCode: 503,
      message: "Receipt temporarily unavailable",
    });
  });
});
