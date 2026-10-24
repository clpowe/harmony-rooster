import { Redis } from "@upstash/redis";
import { AirtableTs, type Table } from "airtable-ts";
import Stripe from "stripe";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "../../shared/constants/airtable";
import { captureServerError, createRequestLogger, createServerLogger } from "../utils/logger";
import { useServerStripe } from "../utils/stripe";
import { createError } from "h3";
import type {
  StripeWebhookRefundEvent,
  StripeWebhookRegistrationEvent,
  StripeWebhookRegistrationRecord,
} from "../../shared/types/stripe-webhooks";
import { sendReceiptEmail, type ReceiptEmailInput } from "./receipt-emails";
import {
  fulfillmentSessionsTable as sessionsTable,
  customersTable,
  type AirtableSessionRecord,
  type AirtableCustomerRecord,
} from "../data/airtable-tables";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const FIFTEEN_MINUTES_IN_SECONDS = 60 * 15;
const MAX_RECEIPT_ATTEMPTS = 5;

const INCREMENT_ATTEMPTS_SCRIPT = `
local n = redis.call("INCR", KEYS[1])
redis.call("EXPIRE", KEYS[1], ARGV[1])
return n
`;

const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end

return 0
`;

type H3Event = any;
let redisClient: Redis | null = null;
// SubtleCrypto verifies signatures on Node and Workers alike; Node's sync crypto is unavailable on Workers.
const webhookCryptoProvider = Stripe.createSubtleCryptoProvider();
const fulfillmentLogger = createServerLogger({
  defaults: {
    source: "stripe-fulfillment",
  },
});

function getAirtableClient(event: H3Event, dependencies: FulfillmentDependencies): AirtableTs {
  const config = dependencies.getRuntimeConfig(event);

  if (!config.airtableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  const airtable = dependencies.createAirtableClient(config.airtableKey);
  if (!airtable) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Airtable client was not initialized",
    });
  }

  return airtable;
}

type FulfillmentStatus =
  | "processing"
  | "fulfilled"
  | "failed"
  | "refund_required"
  | "refund_pending"
  | "refunded"
  | "refund_failed"
  | "manual_review";

type FulfillmentFailureCode = "session_full" | "registration_missing" | "registration_unlinked";

export type FulfillmentRecord = {
  attemptCount: number;
  checkoutSessionId: string;
  claimedAt?: string;
  failedAt?: string;
  failureCode?: FulfillmentFailureCode;
  fulfilledAt?: string;
  internalCustomerId?: string;
  internalSessionId?: string;
  lastAttemptAt: string;
  lastError?: string;
  manualReviewAt?: string;
  paymentIntentId?: string;
  registrationId?: string;
  refundEventId?: string;
  refundFailedAt?: string;
  refundId?: string;
  refundAttemptIds?: string[];
  refundRequestedAt?: string;
  refundedAt?: string;
  refundStatus?: string | null;
  status: FulfillmentStatus;
  stripeEventId: string;
  // Legacy read-only: the sent marker now lives in its own Redis key.
  receiptSentAt?: string;
};

export type ClaimResult =
  | {
      lockKey: string;
      lockToken: string;
      ok: true;
      record: FulfillmentRecord;
      recordKey: string;
    }
  | {
      ok: false;
      reason: "already_handled" | "in_progress" | "receipt_pending";
      record?: FulfillmentRecord | null;
    };

export type CheckoutContext = {
  checkoutSession: Stripe.Checkout.Session;
  customer: AirtableCustomerRecord;
  internalCustomerId: string;
  internalSessionId: string;
  registrationName: string;
  session: AirtableSessionRecord;
};

export type RegistrationResult = {
  id: string;
};

type SafeRuntimeConfig = {
  airtableKey: string;
  stripeWebhookSecretKey: string;
};

type RedisClient = Pick<Redis, "eval" | "get" | "set">;

export type FulfillmentDependencies = {
  createAirtableClient: (apiKey: string) => AirtableTs;
  getRedisClient: () => RedisClient;
  getRuntimeConfig: (event: H3Event) => SafeRuntimeConfig;
  getStripeClient: (event: H3Event) => Promise<Stripe>;
  sendReceiptEmail: (input: ReceiptEmailInput, event: H3Event) => Promise<{ id: string }>;
};

const registrationsTable: Table<StripeWebhookRegistrationRecord> = {
  name: "registration",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.REGISTRATIONS,
  schema: {
    Name: "string",
    Status: "string",
    Session: "string[]",
    Customer: "string[]",
  },
  mappings: {
    Name: "Name",
    Status: "Status",
    Session: "Session",
    Customer: "Customer",
  },
};

let airtableClient: AirtableTs | null = null;

export const stripeFulfillmentDependencies: FulfillmentDependencies = {
  createAirtableClient: (apiKey) => {
    if (!airtableClient) {
      airtableClient = new AirtableTs({ apiKey });
    }

    return airtableClient;
  },
  getRedisClient: () => {
    if (!redisClient) {
      redisClient = Redis.fromEnv();
    }

    return redisClient;
  },
  getRuntimeConfig: (event) => useRuntimeConfig(event) as SafeRuntimeConfig,
  getStripeClient: async (event) => useServerStripe(event),
  sendReceiptEmail,
};

export async function verifyStripeWebhook(
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<Stripe.Event> {
  const logger = createRequestLogger(event, {
    defaults: {
      operation: "verify-stripe-webhook",
      source: "stripe-webhook",
    },
  });
  const signature = getHeader(event, "stripe-signature");
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing Stripe signature",
    });
  }

  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing request body",
    });
  }

  const stripe = await dependencies.getStripeClient(event);
  const config = dependencies.getRuntimeConfig(event);

  // An empty HMAC key still produces a valid signature, so fail closed.
  const secret =
    typeof config.stripeWebhookSecretKey === "string" ? config.stripeWebhookSecretKey.trim() : "";
  if (!/^whsec_[A-Za-z0-9+/=]{24,}$/.test(secret)) {
    const misconfigurationError = new Error("Stripe webhook secret is not configured");
    captureServerError(misconfigurationError, {
      context: {
        operation: "verify-stripe-webhook",
        source: "stripe-webhook",
      },
      event,
      message: "Stripe webhook secret is not configured",
    });
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Stripe webhook secret is not configured",
    });
  }

  try {
    const stripeEvent = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      secret,
      undefined,
      webhookCryptoProvider,
    );
    logger.info("Verified Stripe webhook signature", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    });
    return stripeEvent;
  } catch (error: any) {
    captureServerError(error, {
      context: {
        operation: "verify-stripe-webhook",
        source: "stripe-webhook",
      },
      event,
      message: "Stripe webhook signature verification failed",
    });
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Webhook Error: ${error.message}`,
    });
  }
}

export function isFulfillmentCandidate(
  stripeEvent: Stripe.Event,
): stripeEvent is StripeWebhookRegistrationEvent {
  return (
    stripeEvent.type === "checkout.session.completed" ||
    stripeEvent.type === "checkout.session.async_payment_succeeded"
  );
}

export function isRefundCandidate(
  stripeEvent: Stripe.Event,
): stripeEvent is StripeWebhookRefundEvent {
  return (
    stripeEvent.type === "refund.created" ||
    stripeEvent.type === "refund.updated" ||
    stripeEvent.type === "refund.failed"
  );
}

type PendingReceipt = {
  checkoutSession: Stripe.Checkout.Session;
  context?: CheckoutContext;
  metadata: {
    internalCustomerId: string;
    internalSessionId: string;
  };
  registrationId: string;
};

export async function fulfillCheckout(
  checkoutSessionId: string,
  stripeEventId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  const pendingReceipt = await fulfillUnderLock(
    checkoutSessionId,
    stripeEventId,
    event,
    dependencies,
  );

  // Email goes out after the course-session lock is released.
  if (pendingReceipt) {
    await deliverReceipt(pendingReceipt, event, dependencies);
  }
}

async function fulfillUnderLock(
  checkoutSessionId: string,
  stripeEventId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies,
): Promise<PendingReceipt | null> {
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "fulfill-checkout",
      recordKey,
      source: "stripe-fulfillment",
      stripeEventId,
    },
  });
  let claim: ClaimResult | null = null;
  logger.info("Starting checkout fulfillment");

  try {
    const stripe = await dependencies.getStripeClient(event);
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["payment_intent", "payment_intent.latest_charge"],
    });

    if (!isPaidCheckoutSession(checkoutSession)) {
      logger.warn("Skipping checkout fulfillment: session not fulfillable", {
        mode: checkoutSession.mode,
        paymentStatus: checkoutSession.payment_status,
        status: checkoutSession.status,
      });
      return null;
    }

    const metadata = getRequiredMetadata(checkoutSession);

    claim = await claimFulfillment(checkoutSessionId, stripeEventId, metadata, dependencies);

    logger.info("Claim fulfillment result", {
      claimReason: claim.ok ? undefined : claim.reason,
      claimStatus: claim.ok ? claim.record.status : undefined,
    });

    if (!claim.ok) {
      if (claim.reason === "already_handled") {
        return null;
      }

      if (claim.reason === "receipt_pending") {
        const registrationId = claim.record?.registrationId;
        if (!registrationId) {
          logger.error("Fulfilled record has no registration id; skipping receipt");
          return null;
        }

        return {
          checkoutSession,
          metadata,
          registrationId,
        };
      }

      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable",
        message: `Session ${metadata.internalSessionId} fulfillment is already in progress`,
      });
    }

    if (claim.record.status === "refund_required") {
      await refundCheckoutForFullSession(
        checkoutSession,
        metadata,
        recordKey,
        claim.record,
        event,
        dependencies,
      );
      return null;
    }

    const context = await loadCheckoutContext(checkoutSession, metadata, event, dependencies);

    // A registration inserted by an earlier attempt already counts against capacity.
    const registrations = context.session.registrations ?? [];
    const persistedRegistrationId = claim.record.registrationId;
    let ownsSeat =
      Boolean(persistedRegistrationId) && registrations.includes(persistedRegistrationId!);

    // Links are reciprocal and synchronous, so a registration missing from the session snapshot was edited or deleted by an admin.
    if (persistedRegistrationId && !ownsSeat) {
      const airtable = getAirtableClient(event, dependencies);
      let registration: StripeWebhookRegistrationRecord | null = null;
      try {
        registration = await airtable.get(registrationsTable, persistedRegistrationId);
      } catch (error: unknown) {
        if (!isAirtableNotFoundError(error)) {
          throw error;
        }
      }

      if (!registration) {
        await writeFulfillmentRecord(
          recordKey,
          {
            ...claim.record,
            failureCode: "registration_missing",
            lastError: `Registration ${persistedRegistrationId} for checkout session ${checkoutSessionId} no longer exists in Airtable`,
            manualReviewAt: new Date().toISOString(),
            status: "manual_review",
          },
          dependencies,
        );
        logger.error("Persisted registration is missing; manual review required", {
          registrationId: persistedRegistrationId,
        });
        return null;
      }

      if (!registration.Session?.includes(metadata.internalSessionId)) {
        await writeFulfillmentRecord(
          recordKey,
          {
            ...claim.record,
            failureCode: "registration_unlinked",
            lastError: `Registration ${persistedRegistrationId} for checkout session ${checkoutSessionId} is not linked to course session ${metadata.internalSessionId}`,
            manualReviewAt: new Date().toISOString(),
            status: "manual_review",
          },
          dependencies,
        );
        logger.error(
          "Persisted registration is not linked to this session; manual review required",
          {
            registrationId: persistedRegistrationId,
          },
        );
        return null;
      }

      ownsSeat = true;
    }
    const sessionIsFull =
      !ownsSeat &&
      (context.session.spotsAvailable <= 0 || registrations.length >= context.session.capacity);

    if (sessionIsFull) {
      if (claim.record.registrationId || claim.record.attemptCount > 1) {
        const reason = claim.record.registrationId
          ? `Checkout session ${checkoutSessionId} has a persisted registration and cannot be automatically refunded`
          : `Checkout session ${checkoutSessionId} reached capacity on a retry without a persisted registration id`;
        await writeFulfillmentRecord(
          recordKey,
          {
            ...claim.record,
            failureCode: "session_full",
            lastError: reason,
            manualReviewAt: new Date().toISOString(),
            status: "manual_review",
          },
          dependencies,
        );
        logger.error("Checkout requires manual capacity review", {
          attemptCount: claim.record.attemptCount,
          registrationId: claim.record.registrationId,
        });
        return null;
      }

      await refundCheckoutForFullSession(
        checkoutSession,
        metadata,
        recordKey,
        claim.record,
        event,
        dependencies,
      );
      return null;
    }

    const registration = await createRegistration(context, event, dependencies, {
      fulfillmentRecord: claim.record,
      recordKey,
    });

    await markFulfillmentSucceeded(
      recordKey,
      {
        ...claim.record,
        internalCustomerId: context.internalCustomerId,
        internalSessionId: context.internalSessionId,
        registrationId: registration.id,
      },
      dependencies,
    );
    logger.info("Marked fulfillment succeeded", {
      registrationId: registration.id,
    });

    return {
      checkoutSession,
      context,
      metadata,
      registrationId: registration.id,
    };
  } catch (error: any) {
    if (claim && !claim.ok && claim.reason === "in_progress") {
      throw error;
    }

    captureServerError(error, {
      context: {
        checkoutSessionId,
        operation: "fulfill-checkout",
        recordKey,
        source: "stripe-fulfillment",
        stripeEventId,
      },
      event,
      message: "Checkout fulfillment failed",
    });

    // Without a claim this worker does not hold the lock, so it must not write the record.
    if (!claim?.ok) {
      throw error;
    }

    let existingRecord: FulfillmentRecord | null;
    try {
      existingRecord = await readFulfillmentRecord(recordKey, dependencies);
    } catch (readError: any) {
      captureServerError(readError, {
        context: {
          checkoutSessionId,
          operation: "fulfill-checkout.read-record",
          recordKey,
          source: "stripe-fulfillment",
          stripeEventId,
        },
        event,
        message: "Failed to read fulfillment record after checkout failure",
      });
      throw error;
    }

    if (existingRecord && isRemediationStatus(existingRecord.status)) {
      throw error;
    }

    if (existingRecord?.status === "fulfilled") {
      throw error;
    }

    const failureRecord: FulfillmentRecord = {
      ...claim.record,
      ...existingRecord,
      lastError: error?.message ?? "Unknown error",
    };

    await markFulfillmentFailed(recordKey, failureRecord, dependencies);
    logger.warn("Marked fulfillment failed", {
      checkoutSessionId,
      recordKey,
    });

    throw error;
  } finally {
    if (claim?.ok) {
      await releaseFulfillmentLock(claim.lockKey, claim.lockToken, dependencies);
    }
  }
}

export async function claimFulfillment(
  checkoutSessionId: string,
  stripeEventId: string,
  metadata: {
    internalCustomerId?: string;
    internalSessionId: string;
  },
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<ClaimResult> {
  const redisClient = dependencies.getRedisClient();
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);

  // The record remains Checkout-scoped, but the lock is course-session-scoped.
  const lockKey = getFulfillmentLockKey(metadata.internalSessionId);

  let existingRecord = await readFulfillmentRecord(recordKey, dependencies);

  if (existingRecord && isHandledRecord(existingRecord)) {
    return {
      ok: false,
      reason: (await isReceiptPending(existingRecord, dependencies))
        ? "receipt_pending"
        : "already_handled",
      record: existingRecord,
    };
  }

  // A unique token prevents an expired worker from releasing a newer lock.
  const lockToken = globalThis.crypto.randomUUID();

  const locked = await redisClient.set(lockKey, lockToken, {
    ex: FIFTEEN_MINUTES_IN_SECONDS,
    nx: true,
  });

  if (!locked) {
    const latestRecord = await readFulfillmentRecord(recordKey, dependencies);
    if (latestRecord && isHandledRecord(latestRecord)) {
      return {
        ok: false,
        reason: (await isReceiptPending(latestRecord, dependencies))
          ? "receipt_pending"
          : "already_handled",
        record: latestRecord,
      };
    }

    return {
      ok: false,
      reason: "in_progress",
      record: latestRecord,
    };
  }

  let passLockToCaller = false;

  try {
    // Recheck after acquiring the lock because the pre-lock read can be stale.
    existingRecord = await readFulfillmentRecord(recordKey, dependencies);

    if (existingRecord && isHandledRecord(existingRecord)) {
      return {
        ok: false,
        reason: (await isReceiptPending(existingRecord, dependencies))
          ? "receipt_pending"
          : "already_handled",
        record: existingRecord,
      };
    }

    const now = new Date().toISOString();
    const resumeRefund = existingRecord?.status === "refund_required";

    const nextRecord: FulfillmentRecord = {
      ...existingRecord,
      attemptCount: (existingRecord?.attemptCount ?? 0) + 1,
      checkoutSessionId,
      claimedAt: existingRecord?.claimedAt ?? now,
      internalCustomerId: metadata.internalCustomerId ?? existingRecord?.internalCustomerId,
      internalSessionId: metadata.internalSessionId,
      lastAttemptAt: now,
      registrationId: existingRecord?.registrationId,
      status: resumeRefund ? "refund_required" : "processing",
      stripeEventId,
    };

    await writeFulfillmentRecord(recordKey, nextRecord, dependencies);

    passLockToCaller = true;

    return {
      lockKey,
      lockToken,
      ok: true,
      record: nextRecord,
      recordKey,
    };
  } finally {
    // If claiming failed or discovered completed work, no caller will release it.
    if (!passLockToCaller) {
      await releaseFulfillmentLock(lockKey, lockToken, dependencies);
    }
  }
}

async function loadCheckoutContext(
  checkoutSession: Stripe.Checkout.Session,
  metadata: {
    internalCustomerId: string;
    internalSessionId: string;
  },
  event: H3Event,
  dependencies: FulfillmentDependencies,
): Promise<CheckoutContext> {
  const checkoutSessionId = checkoutSession.id;

  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "load-checkout-context",
      source: "stripe-fulfillment",
    },
  });

  const airtable = getAirtableClient(event, dependencies);
  const [session, customer] = await Promise.all([
    airtable.get(sessionsTable, metadata.internalSessionId),
    airtable.get(customersTable, metadata.internalCustomerId),
  ]);

  logger.info("Loaded Airtable records for checkout context", {
    customerId: customer.id,
    sessionId: session.id,
    sessionRegistrationsCount: session.registrations?.length ?? 0,
    spotsAvailable: session.spotsAvailable,
  });

  const registrationFirstName = checkoutSession.metadata?.first_name?.trim() || customer.first_name;
  const registrationLastName = checkoutSession.metadata?.last_name?.trim() || customer.last_name;
  return {
    checkoutSession,
    customer,
    internalCustomerId: metadata.internalCustomerId,
    internalSessionId: metadata.internalSessionId,
    registrationName:
      `${registrationFirstName} ${registrationLastName} - ${metadata.internalSessionId}`.trim(),
    session,
  };
}

async function createRegistration(
  context: CheckoutContext,
  event: H3Event,
  dependencies: FulfillmentDependencies,
  fulfillmentState: {
    fulfillmentRecord: FulfillmentRecord;
    recordKey: string;
  },
): Promise<RegistrationResult> {
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId: context.checkoutSession.id,
      operation: "create-registration",
      source: "stripe-fulfillment",
    },
  });
  const airtable = getAirtableClient(event, dependencies);
  const registrationPayload = {
    Name: context.registrationName,
    Status: "Paid" as const,
    Session: [context.internalSessionId],
    Customer: [context.internalCustomerId],
  };

  let registrationId = fulfillmentState.fulfillmentRecord.registrationId;

  if (!registrationId) {
    const registration = await airtable.insert(registrationsTable, registrationPayload);
    registrationId = registration.id;

    logger.info("Created Airtable registration", {
      registrationId,
      sessionId: context.internalSessionId,
    });

    await writeFulfillmentRecord(
      fulfillmentState.recordKey,
      {
        ...fulfillmentState.fulfillmentRecord,
        internalCustomerId: context.internalCustomerId,
        internalSessionId: context.internalSessionId,
        registrationId,
        status: "processing",
      },
      dependencies,
    );

    logger.info("Persisted fulfillment registration id", {
      registrationId,
      sessionId: context.internalSessionId,
    });
  } else {
    logger.info("Reusing persisted Airtable registration", {
      registrationId,
      sessionId: context.internalSessionId,
    });
  }

  return { id: registrationId };
}

async function markFulfillmentSucceeded(
  recordKey: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  await writeFulfillmentRecord(
    recordKey,
    {
      ...record,
      fulfilledAt: new Date().toISOString(),
      lastError: undefined,
      status: "fulfilled",
    },
    dependencies,
  );
}

async function deliverReceipt(
  pendingReceipt: PendingReceipt,
  event: H3Event,
  dependencies: FulfillmentDependencies,
): Promise<void> {
  const { checkoutSession, metadata, registrationId } = pendingReceipt;
  const checkoutSessionId = checkoutSession.id;
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "deliver-receipt",
      recordKey,
      source: "stripe-fulfillment",
    },
  });

  const paymentIntent = checkoutSession.payment_intent;
  const latestCharge =
    paymentIntent && typeof paymentIntent !== "string" ? paymentIntent.latest_charge : null;
  const charge = latestCharge && typeof latestCharge !== "string" ? latestCharge : null;

  if (charge && (charge.refunded === true || charge.amount_refunded > 0)) {
    logger.error("Skipping receipt for refunded charge", {
      chargeId: charge.id,
      registrationId,
    });
    return;
  }

  let sent = false;
  try {
    const context =
      pendingReceipt.context ??
      (await loadCheckoutContext(checkoutSession, metadata, event, dependencies));

    await dependencies.sendReceiptEmail(
      {
        to: context.customer.email,
        firstName: context.customer.first_name,
        sessionName: context.session.sessionName,
        sessionDate: context.session.date,
        sessionTime: context.session.time,
        sessionLocation: context.session.location,
        amountMinor: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        receiptUrl: charge?.receipt_url ?? null,
        registrationId,
        idempotencyKey: `receipt:${checkoutSessionId}`,
      },
      event,
    );
    sent = true;
  } catch (error) {
    captureServerError(error, {
      context: {
        checkoutSessionId,
        registrationId,
        operation: "send-receipt-email",
        source: "stripe-fulfillment",
      },
      event,
      message: "Receipt email failed",
    });
  }

  if (sent) {
    try {
      await markReceiptSent(checkoutSessionId, dependencies);
    } catch (error) {
      captureServerError(error, {
        context: {
          checkoutSessionId,
          registrationId,
          operation: "mark-receipt-sent",
          source: "stripe-fulfillment",
        },
        event,
        message: "Receipt sent but delivery not recorded",
      });
      throw createError({
        statusCode: 500,
        statusMessage: "Receipt Not Recorded",
        message: "Receipt sent but delivery could not be recorded",
      });
    }
    return;
  }

  const current = await readFulfillmentRecord(recordKey, dependencies);
  if (!current) {
    logger.error("Receipt delivery failed and fulfillment record is missing", {
      registrationId,
    });
    return;
  }

  if (current.status !== "fulfilled") {
    logger.error("Receipt delivery failed and fulfillment record is not fulfilled", {
      status: current.status,
      registrationId,
    });
    return;
  }

  const redisClient = dependencies.getRedisClient();
  const attemptsKey = getReceiptAttemptsKey(checkoutSessionId);
  const receiptAttemptCount = Number(
    await redisClient.eval<[string], number>(
      INCREMENT_ATTEMPTS_SCRIPT,
      [attemptsKey],
      [String(THIRTY_DAYS_IN_SECONDS)],
    ),
  );

  if (receiptAttemptCount >= MAX_RECEIPT_ATTEMPTS) {
    logger.error("Receipt delivery exhausted; manual follow-up required", {
      receiptAttemptCount,
      registrationId,
    });
    return;
  }

  throw createError({
    statusCode: 503,
    statusMessage: "Receipt Pending",
    message: "Receipt delivery failed; retry scheduled",
  });
}

async function markFulfillmentFailed(
  recordKey: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  await writeFulfillmentRecord(
    recordKey,
    {
      ...record,
      failedAt: new Date().toISOString(),
      status: "failed",
    },
    dependencies,
  );
}

async function refundCheckoutForFullSession(
  checkoutSession: Stripe.Checkout.Session,
  metadata: {
    internalCustomerId: string;
    internalSessionId: string;
  },
  recordKey: string,
  record: FulfillmentRecord,
  event: H3Event,
  dependencies: FulfillmentDependencies,
): Promise<void> {
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId: checkoutSession.id,
      operation: "refund-full-session-checkout",
      recordKey,
      source: "stripe-fulfillment",
    },
  });
  const paymentIntentId = getPaymentIntentId(checkoutSession.payment_intent);
  const now = new Date().toISOString();

  if (!paymentIntentId) {
    await writeFulfillmentRecord(
      recordKey,
      {
        ...record,
        failureCode: "session_full",
        internalCustomerId: metadata.internalCustomerId,
        internalSessionId: metadata.internalSessionId,
        lastError: `Checkout session ${checkoutSession.id} is missing a PaymentIntent for its required refund`,
        status: "refund_required",
      },
      dependencies,
    );

    throw createError({
      statusCode: 500,
      statusMessage: "Refund Required",
      message: `Checkout session ${checkoutSession.id} is missing a PaymentIntent for its required refund`,
    });
  }

  // Persist the refund decision before moving money. Retries must never return
  // this paid Checkout to registration fulfillment, even if capacity changes.
  const remediationRecord: FulfillmentRecord = {
    ...record,
    failureCode: "session_full",
    internalCustomerId: metadata.internalCustomerId,
    internalSessionId: metadata.internalSessionId,
    lastError: undefined,
    paymentIntentId,
    refundRequestedAt: record.refundRequestedAt ?? now,
    status: "refund_required",
  };
  await writeFulfillmentRecord(recordKey, remediationRecord, dependencies);

  const stripe = await dependencies.getStripeClient(event);
  let refund: Stripe.Refund;

  try {
    const refunds = await stripe.refunds.list({
      limit: 100,
      payment_intent: paymentIntentId,
    });
    const existingRefund = refunds.data.find(
      (candidate) =>
        candidate.id === remediationRecord.refundId ||
        (candidate.metadata?.checkout_session_id === checkoutSession.id &&
          candidate.metadata?.remediation_reason === "session_full"),
    );

    refund =
      existingRefund ??
      (await stripe.refunds.create(
        {
          metadata: {
            checkout_session_id: checkoutSession.id,
            internal_session_id: metadata.internalSessionId,
            remediation_reason: "session_full",
          },
          payment_intent: paymentIntentId,
        },
        {
          idempotencyKey: getSessionFullRefundIdempotencyKey(checkoutSession.id),
        },
      ));
  } catch (error: any) {
    await writeFulfillmentRecord(
      recordKey,
      {
        ...remediationRecord,
        lastError: error?.message ?? "Stripe refund request failed",
      },
      dependencies,
    );
    throw error;
  }

  await persistRefundOutcome(recordKey, remediationRecord, refund, dependencies);
  const refundLogContext = {
    refundId: refund.id,
    refundStatus: refund.status,
  };
  if (isFailedRefundStatus(refund.status)) {
    logger.error("Session-full refund requires manual review", refundLogContext);
  } else {
    logger.info("Persisted session-full refund outcome", refundLogContext);
  }
}

export async function reconcileRefund(
  refund: Stripe.Refund,
  stripeEventId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<boolean> {
  const checkoutSessionId = refund.metadata?.checkout_session_id?.trim();
  const remediationReason = refund.metadata?.remediation_reason?.trim();

  if (!checkoutSessionId || remediationReason !== "session_full") {
    return false;
  }

  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "reconcile-refund",
      recordKey,
      source: "stripe-fulfillment",
      stripeEventId,
    },
  });
  const initialRecord = await readFulfillmentRecord(recordKey, dependencies);
  const metadataSessionId = refund.metadata?.internal_session_id?.trim();
  const internalSessionId = initialRecord?.internalSessionId ?? metadataSessionId;

  if (!internalSessionId) {
    logger.warn("Ignoring refund event without an internal session id", {
      refundId: refund.id,
    });
    return false;
  }

  if (
    initialRecord?.internalSessionId &&
    metadataSessionId &&
    initialRecord.internalSessionId !== metadataSessionId
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Refund ${refund.id} does not match the stored course session`,
    });
  }

  const redisClient = dependencies.getRedisClient();
  const lockKey = getFulfillmentLockKey(internalSessionId);
  const lockToken = globalThis.crypto.randomUUID();
  const locked = await redisClient.set(lockKey, lockToken, {
    ex: FIFTEEN_MINUTES_IN_SECONDS,
    nx: true,
  });

  if (!locked) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      message: `Refund reconciliation for session ${internalSessionId} is already in progress`,
    });
  }

  try {
    const current = await readFulfillmentRecord(recordKey, dependencies);

    if (current?.status === "fulfilled") {
      logger.warn("Ignoring refund event for a fulfilled registration", {
        refundId: refund.id,
        registrationId: current.registrationId,
      });
      return false;
    }

    if (current?.internalSessionId && current.internalSessionId !== internalSessionId) {
      throw createError({
        statusCode: 409,
        statusMessage: "Refund Conflict",
        message: `Refund ${refund.id} does not match the stored course session`,
      });
    }

    const now = new Date().toISOString();
    const paymentIntentId = getPaymentIntentId(refund.payment_intent);
    const record: FulfillmentRecord = current ?? {
      attemptCount: 1,
      checkoutSessionId,
      failureCode: "session_full",
      internalSessionId,
      lastAttemptAt: now,
      paymentIntentId,
      refundRequestedAt: now,
      status: "refund_required",
      stripeEventId,
    };

    await persistRefundOutcome(recordKey, record, refund, dependencies, stripeEventId);
    const refundLogContext = {
      refundId: refund.id,
      refundStatus: refund.status,
    };
    if (isFailedRefundStatus(refund.status)) {
      logger.error("Stripe refund event requires manual review", refundLogContext);
    } else {
      logger.info("Reconciled Stripe refund event", refundLogContext);
    }
    return true;
  } finally {
    await releaseFulfillmentLock(lockKey, lockToken, dependencies);
  }
}

async function persistRefundOutcome(
  recordKey: string,
  record: FulfillmentRecord,
  refund: Stripe.Refund,
  dependencies: FulfillmentDependencies,
  refundEventId?: string,
): Promise<void> {
  const current = await readFulfillmentRecord(recordKey, dependencies);
  const paymentIntentId = getPaymentIntentId(refund.payment_intent);
  const metadataCheckoutSessionId = refund.metadata?.checkout_session_id?.trim();

  if (current?.status === "fulfilled") {
    throw createError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Checkout session ${record.checkoutSessionId} already has a fulfilled registration`,
    });
  }

  if (metadataCheckoutSessionId && metadataCheckoutSessionId !== record.checkoutSessionId) {
    throw createError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Refund ${refund.id} does not match checkout session ${record.checkoutSessionId}`,
    });
  }

  if (current?.paymentIntentId && current.paymentIntentId !== paymentIntentId) {
    throw createError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Refund ${refund.id} does not match the stored PaymentIntent`,
    });
  }

  if (current?.refundId && current.refundId !== refund.id) {
    const isReplacementForFailedRefund =
      current.status === "refund_failed" && Boolean(paymentIntentId);

    if (!isReplacementForFailedRefund) {
      throw createError({
        statusCode: 409,
        statusMessage: "Refund Conflict",
        message: `Checkout session ${record.checkoutSessionId} is already linked to another refund`,
      });
    }
  }

  if (
    current?.refundId === refund.id &&
    (current.status === "refunded" || current.status === "refund_failed")
  ) {
    return;
  }

  const now = new Date().toISOString();
  const baseRecord: FulfillmentRecord = {
    ...record,
    ...current,
    failureCode: "session_full",
    paymentIntentId: paymentIntentId ?? record.paymentIntentId,
    refundAttemptIds: Array.from(
      new Set(
        [
          ...(current?.refundAttemptIds ?? record.refundAttemptIds ?? []),
          current?.refundId,
          refund.id,
        ].filter((id): id is string => Boolean(id)),
      ),
    ),
    refundEventId: refundEventId ?? current?.refundEventId,
    refundId: refund.id,
    refundRequestedAt: current?.refundRequestedAt ?? record.refundRequestedAt ?? now,
    refundStatus: refund.status,
  };

  if (refund.status === "succeeded") {
    await writeFulfillmentRecord(
      recordKey,
      {
        ...baseRecord,
        lastError: undefined,
        refundFailedAt: undefined,
        refundedAt: current?.refundedAt ?? now,
        status: "refunded",
      },
      dependencies,
    );
    return;
  }

  if (refund.status === "pending" || refund.status === "requires_action") {
    await writeFulfillmentRecord(
      recordKey,
      {
        ...baseRecord,
        lastError: undefined,
        refundFailedAt: undefined,
        status: "refund_pending",
      },
      dependencies,
    );
    return;
  }

  await writeFulfillmentRecord(
    recordKey,
    {
      ...baseRecord,
      lastError:
        refund.failure_reason ??
        `Stripe refund ${refund.id} requires manual review with status ${refund.status ?? "unknown"}`,
      refundFailedAt: current?.refundFailedAt ?? now,
      status: "refund_failed",
    },
    dependencies,
  );
}

function getPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null,
): string | undefined {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  return paymentIntent?.id;
}

function getSessionFullRefundIdempotencyKey(checkoutSessionId: string): string {
  return `stripe:fulfillment-refund:session-full:${checkoutSessionId}`;
}

function isFailedRefundStatus(status: string | null): boolean {
  return status !== "succeeded" && status !== "pending" && status !== "requires_action";
}

function isAirtableNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  // airtable.js rejects a missing record with a 404 that airtable-ts wraps and keeps as statusCode.
  return (error as { statusCode?: unknown }).statusCode === 404;
}

function isRemediationStatus(status: FulfillmentStatus): boolean {
  return (
    status === "refund_required" ||
    status === "refund_pending" ||
    status === "refunded" ||
    status === "refund_failed" ||
    status === "manual_review"
  );
}

function isHandledRecord(record: FulfillmentRecord): boolean {
  return (
    record.status === "fulfilled" ||
    record.status === "refund_pending" ||
    record.status === "refunded" ||
    record.status === "refund_failed" ||
    record.status === "manual_review"
  );
}

async function isReceiptPending(
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies,
): Promise<boolean> {
  if (record.status !== "fulfilled") {
    return false;
  }

  const { attempts, sent } = await readReceiptState(record.checkoutSessionId, record, dependencies);
  return !sent && attempts < MAX_RECEIPT_ATTEMPTS;
}

// Records written before the sent marker moved to its own key still carry receiptSentAt.
async function readReceiptState(
  checkoutSessionId: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies,
): Promise<{ attempts: number; sent: boolean }> {
  const redisClient = dependencies.getRedisClient();
  const [sentValue, attemptsValue] = await Promise.all([
    redisClient.get(getReceiptSentKey(checkoutSessionId)),
    redisClient.get(getReceiptAttemptsKey(checkoutSessionId)),
  ]);

  return {
    attempts: Number(attemptsValue ?? 0) || 0,
    sent: (sentValue !== null && sentValue !== undefined) || Boolean(record.receiptSentAt),
  };
}

export async function readFulfillmentRecord(
  recordKey: string,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<FulfillmentRecord | null> {
  const redisClient = dependencies.getRedisClient();
  const stored = await redisClient.get<string | FulfillmentRecord | null>(recordKey);

  if (!stored) {
    return null;
  }

  if (typeof stored === "string") {
    return JSON.parse(stored) as FulfillmentRecord;
  }

  return stored;
}

function isPaidCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.mode === "payment" && session.payment_status === "paid" && session.status === "complete"
  );
}

function getRequiredMetadata(session: Stripe.Checkout.Session): {
  internalCustomerId: string;
  internalSessionId: string;
} {
  const internalSessionId = session.metadata?.sessionID?.trim();
  const internalCustomerId = session.metadata?.customerID?.trim();

  if (!internalSessionId || !internalCustomerId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Checkout session ${session.id} is missing required fulfillment metadata`,
    });
  }

  return {
    internalCustomerId,
    internalSessionId,
  };
}

export async function writeFulfillmentRecord(
  recordKey: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies,
): Promise<void> {
  await dependencies
    .getRedisClient()
    .set(recordKey, JSON.stringify(record), { ex: THIRTY_DAYS_IN_SECONDS });
}

async function releaseFulfillmentLock(
  lockKey: string,
  lockToken: string,
  dependencies: FulfillmentDependencies,
): Promise<void> {
  const released = await dependencies
    .getRedisClient()
    .eval<[string], number>(RELEASE_LOCK_SCRIPT, [lockKey], [lockToken]);

  fulfillmentLogger.info("Released fulfillment lock", {
    lockKey,
    released: released === 1,
  });
}

export function getFulfillmentRecordKey(checkoutSessionId: string): string {
  return `stripe:fulfillment:${checkoutSessionId}`;
}

export function getReceiptSentKey(checkoutSessionId: string): string {
  return `stripe:fulfillment-receipt-sent:${checkoutSessionId}`;
}

export function getReceiptAttemptsKey(checkoutSessionId: string): string {
  return `stripe:fulfillment-receipt-attempts:${checkoutSessionId}`;
}

function getFulfillmentLockKey(internalSessionId: string): string {
  return `stripe:fulfillment-lock:${AIRTABLE_BASE_ID}:session:${internalSessionId}`;
}

export async function markReceiptSent(
  checkoutSessionId: string,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const current = await readFulfillmentRecord(recordKey, dependencies);
  if (current?.status !== "fulfilled") return;
  await dependencies
    .getRedisClient()
    .set(getReceiptSentKey(checkoutSessionId), new Date().toISOString(), {
      ex: THIRTY_DAYS_IN_SECONDS,
      nx: true,
    });
}
