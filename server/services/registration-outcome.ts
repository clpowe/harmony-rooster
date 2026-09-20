import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { AirtableTs, type Table } from "airtable-ts";
import type Stripe from "stripe";
import type {
  RegistrationOutcome,
  RegistrationState,
} from "../../shared/types/registration-outcome";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "../../shared/constants/airtable";
import {
  getFulfillmentRecordKey,
  readFulfillmentRecord,
  type FulfillmentRecord,
} from "./stripe-fulfillment";

// A missing record immediately after payment is expected while the webhook arrives.
// Older/missing records must never imply either a reserved seat or a failed enrollment.
const INITIAL_CONFIRMATION_WINDOW_MS = 10 * 60 * 1000;

type Course = NonNullable<RegistrationOutcome["session"]>;
export type RegistrationOutcomeDependencies = {
  retrieveCheckout: (id: string) => Promise<Stripe.Checkout.Session>;
  readFulfillment: (id: string) => Promise<FulfillmentRecord | null>;
  loadCourse: (id: string) => Promise<Course>;
  now: () => number;
};

const sessionsTable: Table<Course> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: { name: "string", date: "string", time: "string", location: "string" },
  mappings: { name: "session-name", date: "date", time: "time", location: "location" },
};

function productionDependencies(event: H3Event): RegistrationOutcomeDependencies {
  return {
    async retrieveCheckout(id) {
      const { useServerStripe } = await import("#stripe/server");
      const stripe = await useServerStripe(event);
      return stripe.checkout.sessions.retrieve(id, {
        expand: ["payment_intent.payment_method", "payment_intent.latest_charge"],
      });
    },
    readFulfillment: (id) => readFulfillmentRecord(getFulfillmentRecordKey(id)),
    async loadCourse(id) {
      const config = useRuntimeConfig(event);
      return new AirtableTs({ apiKey: config.airtableKey }).get(sessionsTable, id);
    },
    now: Date.now,
  };
}

export function issueReceiptAccess() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function denyAccess(): never {
  throw Object.assign(new Error("A valid receipt link is required"), { statusCode: 403 });
}

const outcomes: Record<RegistrationState, RegistrationOutcome["registration"]> = {
  payment_pending: {
    state: "payment_pending",
    title: "Payment pending",
    message: "Your payment has not completed. Your seat is not yet confirmed.",
    canRefresh: true,
  },
  payment_incomplete: {
    state: "payment_incomplete",
    title: "Payment not completed",
    message: "This checkout did not complete. Contact us if you need help registering.",
    canRefresh: false,
  },
  confirming: {
    state: "confirming",
    title: "Confirming your registration",
    message: "Payment received. We are confirming your registration. Please do not pay again.",
    canRefresh: true,
  },
  confirmed: {
    state: "confirmed",
    title: "Registration confirmed",
    message: "Your spot has been reserved.",
    canRefresh: false,
  },
  refund_pending: {
    state: "refund_pending",
    title: "Refund in progress",
    message: "We could not reserve your seat. Your refund is being processed.",
    canRefresh: true,
  },
  refunded: {
    state: "refunded",
    title: "Payment refunded",
    message: "Your payment has been refunded. Contact us if you need help with your registration.",
    canRefresh: false,
  },
  needs_attention: {
    state: "needs_attention",
    title: "Your registration needs attention",
    message:
      "We cannot confirm your registration. Please contact us for help and do not pay again.",
    canRefresh: false,
  },
  unavailable: {
    state: "unavailable",
    title: "Registration status unavailable",
    message:
      "We cannot verify your registration status right now. This does not mean it was cancelled. Please contact us if you need confirmation.",
    canRefresh: false,
  },
};

function registrationState(
  checkout: Stripe.Checkout.Session,
  record: FulfillmentRecord | null,
  storageAvailable: boolean,
  now: number,
): RegistrationState {
  if (checkout.mode !== "payment") return "unavailable";
  const intent = typeof checkout.payment_intent === "object" ? checkout.payment_intent : null;
  const charge = typeof intent?.latest_charge === "object" ? intent.latest_charge : null;
  if (charge?.refunded) return "refunded";
  if (charge && charge.amount_refunded > 0) return "needs_attention";

  if (checkout.payment_status !== "paid") {
    return checkout.status === "expired" ? "payment_incomplete" : "payment_pending";
  }
  if (!storageAvailable || !checkout.metadata?.sessionID || !checkout.metadata?.customerID)
    return "unavailable";
  if (record) {
    if (
      record.checkoutSessionId !== checkout.id ||
      record.internalSessionId !== checkout.metadata?.sessionID ||
      (record.internalCustomerId && record.internalCustomerId !== checkout.metadata?.customerID)
    ) {
      return "unavailable";
    }
    switch (record.status) {
      case "fulfilled":
        return checkout.status === "complete" &&
          record.registrationId &&
          record.internalCustomerId === checkout.metadata.customerID
          ? "confirmed"
          : "unavailable";
      case "processing":
        return "confirming";
      case "refund_required":
      case "refund_pending":
        return "refund_pending";
      case "refunded":
        return "refunded";
      case "failed":
      case "refund_failed":
      case "manual_review":
        return "needs_attention";
      default:
        return "unavailable";
    }
  }
  // Checkout can stay open for hours before payment succeeds.
  const paidAt = charge?.created ?? checkout.created;
  const age = now - paidAt * 1000;
  return age >= 0 && age < INITIAL_CONFIRMATION_WINDOW_MS ? "confirming" : "unavailable";
}

export async function loadRegistrationOutcome(
  checkoutSessionId: string,
  token: string,
  event: H3Event,
  dependencies: RegistrationOutcomeDependencies = productionDependencies(event),
): Promise<RegistrationOutcome> {
  if (!/^cs_[A-Za-z0-9_]{1,240}$/.test(checkoutSessionId) || !/^[a-f0-9]{64}$/.test(token))
    denyAccess();
  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await dependencies.retrieveCheckout(checkoutSessionId);
  } catch (error) {
    if ((error as { code?: string }).code === "resource_missing") denyAccess();
    throw Object.assign(new Error("Receipt temporarily unavailable"), { statusCode: 503 });
  }
  const expectedHash = checkout.metadata?.receipt_token_hash;
  if (
    checkout.id !== checkoutSessionId ||
    !expectedHash ||
    !/^[a-f0-9]{64}$/.test(expectedHash) ||
    !timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(hashToken(token), "hex"))
  )
    denyAccess();

  let storageAvailable = true;
  const [record, session] = await Promise.all([
    dependencies.readFulfillment(checkoutSessionId).catch(() => {
      storageAvailable = false;
      return null;
    }),
    checkout.metadata?.sessionID
      ? dependencies.loadCourse(checkout.metadata.sessionID).catch(() => null)
      : Promise.resolve(null),
  ]);
  const state = registrationState(checkout, record, storageAvailable, dependencies.now());
  const intent = typeof checkout.payment_intent === "object" ? checkout.payment_intent : null;
  const method = typeof intent?.payment_method === "object" ? intent.payment_method : null;
  return {
    registration: { ...outcomes[state] },
    payment: {
      status: checkout.payment_status,
      brand: method?.card?.brand ?? null,
      last4: method?.card?.last4 ?? null,
      total: checkout.amount_total,
      currency: checkout.currency,
    },
    // Explicit selection prevents adapter fields from leaking into the response.
    session: session
      ? {
          id: session.id,
          name: session.name,
          date: session.date,
          time: session.time,
          location: session.location,
        }
      : null,
  };
}
