import { Redis } from "@upstash/redis";
import { AirtableTs, type Table } from "airtable-ts";
import Stripe from "stripe";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "../../shared/constants/airtable";
import { captureServerError, createRequestLogger, createServerLogger } from "../utils/logger";
import type {
  StripeWebhookRefundEvent,
  StripeWebhookRegistrationEvent,
  StripeWebhookRegistrationRecord,
} from "../../shared/types/stripe-webhooks";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const FIFTEEN_MINUTES_IN_SECONDS = 60 * 15;

const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end

return 0
`;

type H3Event = any;
let redisClient: Redis | null = null;
const fulfillmentLogger = createServerLogger({
  defaults: {
    source: "stripe-fulfillment",
  },
});

function httpError(details: { message: string; statusCode: number; statusMessage?: string }) {
  return Object.assign(new Error(details.message), details);
}

function getAirtableClient(event: H3Event, dependencies: FulfillmentDependencies): AirtableClient {
  const config = dependencies.getRuntimeConfig(event);

  if (!config.airtableKey) {
    throw httpError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  const airtable = dependencies.createAirtableClient(config.airtableKey);
  if (!airtable) {
    throw httpError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Airtable client was not initialized",
    });
  }

  return airtable;
}

type AirtableSessionRecord = {
  capacity: number;
  id: string;
  sessionName: string;
  date: string;
  location: string;
  registrations: string[];
  time: string;
  spotsAvailable: number;
};

type AirtableCustomerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  stripeID: string | null;
};

type FulfillmentStatus =
  | "processing"
  | "fulfilled"
  | "failed"
  | "refund_required"
  | "refund_pending"
  | "refunded"
  | "refund_failed"
  | "manual_review";

type FulfillmentFailureCode = "session_full";

class SessionFullError extends Error {
  readonly code = "SESSION_FULL";
  readonly statusCode = 409;
  readonly statusMessage = "Session Full";

  constructor(readonly internalSessionId: string) {
    super(`Session ${internalSessionId} has no seats remaining`);
    this.name = "SessionFullError";
  }
}

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
      reason: "already_handled" | "in_progress";
      record?: FulfillmentRecord | null;
    };

export type CheckoutContext = {
  checkoutSession: Stripe.Checkout.Session;
  customer: AirtableCustomerRecord;
  internalCustomerId: string;
  internalSessionId: string;
  registrationName: string;
  session: AirtableSessionRecord;
  stripeCustomerId: string;
};

export type RegistrationResult = {
  id: string;
};

type SafeRuntimeConfig = {
  airtableKey: string;
  posthogHost?: string;
  posthogLogEndpoint?: string;
  posthogProjectApiKey?: string;
  posthogServerLogEnabled?: boolean | string;
  stripeWebhookSecretKey: string;
  resendApiKey?: string;
  contactFromEmail?: string;
};

type RedisClient = Pick<Redis, "eval" | "get" | "set">;

type StripeClient = Stripe;

type AirtableClient = AirtableTs;

export type FulfillmentDependencies = {
  createAirtableClient: (apiKey: string) => AirtableClient;
  getRedisClient: () => RedisClient;
  getRuntimeConfig: (event: H3Event) => SafeRuntimeConfig;
  getStripeClient: (event: H3Event) => Promise<StripeClient>;
};

const sessionsTable: Table<AirtableSessionRecord> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: {
    capacity: "number",
    sessionName: "string",
    date: "string",
    location: "string",
    registrations: "string[]",
    time: "string",
    spotsAvailable: "number",
  },
  mappings: {
    capacity: "capacity",
    sessionName: "session-name",
    date: "date",
    location: "location",
    registrations: "Registrations",
    time: "time",
    spotsAvailable: "spots-available",
  },
};

const customersTable: Table<AirtableCustomerRecord> = {
  name: "customer",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.CUSTOMERS,
  schema: {
    first_name: "string",
    last_name: "string",
    email: "string",
    phone: "string",
    stripeID: "string | null",
  },
  mappings: {
    first_name: "first_name",
    last_name: "last_name",
    email: "email",
    phone: "phone",
    stripeID: "stripeID",
  },
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

let airtableClient: AirtableClient | null = null;

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
  getStripeClient: async (event) => {
    const { useServerStripe } = await import("#stripe/server");
    return useServerStripe(event);
  },
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
    throw httpError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing Stripe signature",
    });
  }

  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw httpError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing request body",
    });
  }

  const stripe = await dependencies.getStripeClient(event);
  const config = dependencies.getRuntimeConfig(event);
  logger.info("Verifying Stripe webhook signature");

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecretKey,
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
    throw httpError({
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

export async function fulfillCheckout(
  checkoutSessionId: string,
  stripeEventId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
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

  let registration: RegistrationResult;

  try {
    const checkoutSession = await retrieveCheckoutSession(checkoutSessionId, event, dependencies);
    logger.info("Retrieved Stripe checkout session", {
      customerType: typeof checkoutSession.customer,
      mode: checkoutSession.mode,
      paymentStatus: checkoutSession.payment_status,
      status: checkoutSession.status,
    });

    if (!isPaidCheckoutSession(checkoutSession)) {
      logger.warn("Skipping checkout fulfillment: session not fulfillable", {
        mode: checkoutSession.mode,
        paymentStatus: checkoutSession.payment_status,
        status: checkoutSession.status,
      });
      return;
    }

    const metadata = getRequiredMetadata(checkoutSession);

    claim = await claimFulfillment(checkoutSessionId, stripeEventId, metadata, dependencies);

    logger.info("Claim fulfillment result", {
      claimReason: claim.ok ? undefined : claim.reason,
      claimStatus: claim.ok ? claim.record.status : undefined,
    });

    if (!claim.ok) {
      if (claim.reason === "already_handled") {
        return;
      }

      throw httpError({
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
      return;
    }

    const context = await loadCheckoutContext(
      checkoutSessionId,
      event,
      dependencies,
      checkoutSession,
    );

    logger.info("Loaded checkout context", {
      internalCustomerId: context.internalCustomerId,
      internalSessionId: context.internalSessionId,
      registrationName: context.registrationName,
      spotsAvailable: context.session.spotsAvailable,
      stripeCustomerId: context.stripeCustomerId,
    });

    try {
      validateCheckoutContext(context);
    } catch (error) {
      if (!(error instanceof SessionFullError)) {
        throw error;
      }

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
        logger.warn("Checkout requires manual capacity review", {
          attemptCount: claim.record.attemptCount,
          registrationId: claim.record.registrationId,
        });
        return;
      }

      await refundCheckoutForFullSession(
        checkoutSession,
        metadata,
        recordKey,
        claim.record,
        event,
        dependencies,
      );
      return;
    }
    logger.info("Validated checkout context", {
      internalCustomerId: context.internalCustomerId,
      internalSessionId: context.internalSessionId,
    });

    registration = await createRegistration(context, event, dependencies, {
      fulfillmentRecord: claim.record,
      recordKey,
    });

    logger.info("Created registration for checkout fulfillment", {
      registrationId: registration.id,
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

    console.log("Sould send email");
    try {
      const { sendReceiptEmail } = await import("./receipt-emails");
      console.log("sending email");
      const result = await sendReceiptEmail(context, registration.id, event);
      if (result) {
        console.log("email Sent");
        await markReceiptSent(checkoutSession.id, dependencies);
      }
    } catch (error) {
      captureServerError(error, {
        context: {
          checkoutSessionId,
          registrationId: registration.id,
          operation: "send-receipt-email",
          source: "stripe-fulfillment",
        },
        event,
        message: "Receipt email failed",
      });
    }
  } catch (error: any) {
    if (claim && !claim.ok && claim.reason === "in_progress") {
      throw error;
    }

    const existingRecord = await readFulfillmentRecord(recordKey, dependencies);
    captureServerError(error, {
      context: {
        checkoutSessionId,
        existingRecord,
        operation: "fulfill-checkout",
        recordKey,
        source: "stripe-fulfillment",
        stripeEventId,
      },
      event,
      message: "Checkout fulfillment failed",
    });
    if (existingRecord && isRemediationStatus(existingRecord.status)) {
      throw error;
    }

    if (existingRecord?.status === "fulfilled") {
      throw error;
    }

    const failureRecord: FulfillmentRecord =
      claim && claim.ok
        ? {
            ...claim.record,
            ...existingRecord,
            lastError: error?.message ?? "Unknown error",
          }
        : {
            attemptCount: (existingRecord?.attemptCount ?? 0) + 1,
            checkoutSessionId,
            claimedAt: existingRecord?.claimedAt,
            internalCustomerId: existingRecord?.internalCustomerId,
            internalSessionId: existingRecord?.internalSessionId,
            lastAttemptAt: new Date().toISOString(),
            registrationId: existingRecord?.registrationId,
            status: "failed",
            stripeEventId,
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
      logger.info("Released fulfillment lock", {
        lockKey: claim.lockKey,
      });
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
      reason: "already_handled",
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
        reason: "already_handled",
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
        reason: "already_handled",
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

export async function loadCheckoutContext(
  checkoutSessionId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
  existingCheckoutSession?: Stripe.Checkout.Session,
): Promise<CheckoutContext> {
  const logger = createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "load-checkout-context",
      source: "stripe-fulfillment",
    },
  });
  const checkoutSession =
    existingCheckoutSession ??
    (await retrieveCheckoutSession(checkoutSessionId, event, dependencies));
  const metadata = getRequiredMetadata(checkoutSession);
  logger.info("Loading checkout context from Airtable", {
    checkoutSessionId,
    metadata,
  });
  const airtable = getAirtableClient(event, dependencies);
  const [session, customer] = await Promise.all([
    airtable.get(sessionsTable, metadata.internalSessionId),
    airtable.get(customersTable, metadata.internalCustomerId),
  ]);
  logger.info("Loaded Airtable records for checkout context", {
    customerId: customer.id,
    customerStripeId: customer.stripeID,
    sessionId: session.id,
    sessionRegistrationsCount: session.registrations?.length ?? 0,
    spotsAvailable: session.spotsAvailable,
  });

  if (!checkoutSession.customer || typeof checkoutSession.customer === "string") {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Checkout session ${checkoutSessionId} is missing an expanded customer`,
    });
  }

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
    stripeCustomerId: checkoutSession.customer.id,
  };
}

export function validateCheckoutContext(context: CheckoutContext): void {
  const checkoutSessionId = context.checkoutSession.id;
  const registrationsCount = context.session.registrations?.length ?? 0;
  fulfillmentLogger.info("Validating checkout context", {
    capacity: context.session.capacity,
    checkoutSessionId,
    customerStripeId: context.customer.stripeID,
    internalCustomerId: context.internalCustomerId,
    internalSessionId: context.internalSessionId,
    registrationsCount,
    spotsAvailable: context.session.spotsAvailable,
    stripeCustomerId: context.stripeCustomerId,
  });

  if (context.checkoutSession.mode !== "payment") {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Unexpected checkout mode for ${checkoutSessionId}`,
    });
  }

  if (context.checkoutSession.payment_status !== "paid") {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Checkout session ${checkoutSessionId} is not paid`,
    });
  }

  if (context.checkoutSession.status !== "complete") {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Checkout session ${checkoutSessionId} is not complete`,
    });
  }

  if (context.session.spotsAvailable <= 0 || registrationsCount >= context.session.capacity) {
    throw new SessionFullError(context.internalSessionId);
  }

  if (!context.customer.stripeID) {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Customer ${context.internalCustomerId} is missing a Stripe customer id`,
    });
  }

  if (context.customer.stripeID !== context.stripeCustomerId) {
    throw httpError({
      statusCode: 500,
      statusMessage: "Fulfillment Error",
      message: `Stripe customer mismatch for checkout session ${checkoutSessionId}`,
    });
  }
}

export async function createRegistration(
  context: CheckoutContext,
  event: H3Event,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
  fulfillmentState?: {
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

  let registrationId = fulfillmentState?.fulfillmentRecord.registrationId;

  if (!registrationId) {
    logger.info("Creating Airtable registration", {
      customerId: context.internalCustomerId,
      customerStripeId: context.stripeCustomerId,
      existingSessionRegistrationsCount: context.session.registrations?.length ?? 0,
      registrationName: context.registrationName,
      sessionId: context.internalSessionId,
    });

    const registration = await airtable.insert(registrationsTable, registrationPayload);
    registrationId = registration.id;

    logger.info("Created Airtable registration", {
      registrationId,
      sessionId: context.internalSessionId,
    });

    if (fulfillmentState) {
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
      logger.info("Persisted fulfillment registration id before session update", {
        registrationId,
        sessionId: context.internalSessionId,
      });
    }
  } else {
    logger.info("Reusing persisted Airtable registration", {
      registrationId,
      sessionId: context.internalSessionId,
    });
  }

  const nextRegistrations = Array.from(
    new Set([...(context.session.registrations ?? []), registrationId]),
  );

  logger.info("Updating Airtable session registrations", {
    currentRegistrationsCount: context.session.registrations?.length ?? 0,
    nextRegistrationsCount: nextRegistrations.length,
    registrationId,
    sessionId: context.internalSessionId,
  });

  try {
    const updatedSession = await airtable.update(sessionsTable, {
      id: context.internalSessionId,
      registrations: nextRegistrations,
    });
    logger.info("Updated Airtable session registrations", {
      registrationId,
      sessionId: context.internalSessionId,
      totalRegistrations: updatedSession.registrations?.length ?? 0,
    });
  } catch (error: any) {
    let sessionFieldNames: string[] | undefined;

    try {
      const airtableSessionTable = await airtable.table(sessionsTable);
      sessionFieldNames = airtableSessionTable.fields.map((field) => field.name);
    } catch (schemaError: any) {
      captureServerError(schemaError, {
        context: {
          operation: "create-registration.schema-introspection",
          sessionId: context.internalSessionId,
          source: "stripe-fulfillment",
        },
        event,
        message: "Failed to introspect Airtable session table schema",
      });
    }

    captureServerError(error, {
      context: {
        nextRegistrationsCount: nextRegistrations.length,
        registrationId,
        sessionFieldNames,
        sessionId: context.internalSessionId,
        source: "stripe-fulfillment",
      },
      event,
      message: "Failed to update Airtable session registrations",
    });
    throw error;
  }

  return { id: registrationId };
}

export async function markFulfillmentSucceeded(
  recordKey: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  fulfillmentLogger.info("Writing fulfilled record", {
    record,
    recordKey,
  });
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

export async function markFulfillmentFailed(
  recordKey: string,
  record: FulfillmentRecord,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  fulfillmentLogger.warn("Writing failed record", {
    record,
    recordKey,
  });
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

    throw httpError({
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
    logger.warn("Session-full refund requires manual review", refundLogContext);
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
    throw httpError({
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
    throw httpError({
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
      throw httpError({
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
      logger.warn("Stripe refund event requires manual review", refundLogContext);
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
    throw httpError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Checkout session ${record.checkoutSessionId} already has a fulfilled registration`,
    });
  }

  if (metadataCheckoutSessionId && metadataCheckoutSessionId !== record.checkoutSessionId) {
    throw httpError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Refund ${refund.id} does not match checkout session ${record.checkoutSessionId}`,
    });
  }

  if (current?.paymentIntentId && current.paymentIntentId !== paymentIntentId) {
    throw httpError({
      statusCode: 409,
      statusMessage: "Refund Conflict",
      message: `Refund ${refund.id} does not match the stored PaymentIntent`,
    });
  }

  if (current?.refundId && current.refundId !== refund.id) {
    const isReplacementForFailedRefund =
      current.status === "refund_failed" && Boolean(paymentIntentId);

    if (!isReplacementForFailedRefund) {
      throw httpError({
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

export async function readFulfillmentRecord(
  recordKey: string,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<FulfillmentRecord | null> {
  const redisClient = dependencies.getRedisClient();
  const stored = await redisClient.get<string | FulfillmentRecord | null>(recordKey);
  fulfillmentLogger.debug("Read fulfillment record", {
    recordKey,
    stored,
  });

  if (!stored) {
    return null;
  }

  if (typeof stored === "string") {
    return JSON.parse(stored) as FulfillmentRecord;
  }

  return stored;
}

async function retrieveCheckoutSession(
  checkoutSessionId: string,
  event: H3Event,
  dependencies: FulfillmentDependencies,
): Promise<Stripe.Checkout.Session> {
  const stripe = await dependencies.getStripeClient(event);
  createRequestLogger(event, {
    defaults: {
      checkoutSessionId,
      operation: "retrieve-checkout-session",
      source: "stripe-fulfillment",
    },
  }).info("Retrieving Stripe checkout session", {
    checkoutSessionId,
  });

  return stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["customer", "payment_intent", "payment_intent.latest_charge"],
  });
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
    throw httpError({
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
  fulfillmentLogger.info("Persisting fulfillment record", {
    record,
    recordKey,
  });
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

export function getFulfillmentLockKey(internalSessionId: string): string {
  return `stripe:fulfillment-lock:${AIRTABLE_BASE_ID}:session:${internalSessionId}`;
}

export async function markReceiptSent(
  checkoutSessionId: string,
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<void> {
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const current = await readFulfillmentRecord(recordKey, dependencies);
  if (!current) return;
  await writeFulfillmentRecord(
    recordKey,
    { ...current, receiptSentAt: new Date().toISOString() },
    dependencies,
  );
}
