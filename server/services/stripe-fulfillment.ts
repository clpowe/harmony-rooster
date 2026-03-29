import { Redis } from "@upstash/redis";
import { AirtableTs, type Table } from "airtable-ts";
import Stripe from "stripe";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "../../shared/constants/airtable";
import { captureServerError, createRequestLogger, createServerLogger } from "../utils/logger";
import type {
  StripeWebhookRegistrationEvent,
  StripeWebhookRegistrationRecord,
} from "../../shared/types/stripe-webhooks";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const FIFTEEN_MINUTES_IN_SECONDS = 60 * 15;
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

type FulfillmentStatus = "processing" | "fulfilled" | "failed";

export type FulfillmentRecord = {
  attemptCount: number;
  checkoutSessionId: string;
  claimedAt?: string;
  failedAt?: string;
  fulfilledAt?: string;
  internalCustomerId?: string;
  internalSessionId?: string;
  lastAttemptAt: string;
  lastError?: string;
  registrationId?: string;
  status: FulfillmentStatus;
  stripeEventId: string;
};

export type ClaimResult =
  | {
      lockKey: string;
      ok: true;
      record: FulfillmentRecord;
      recordKey: string;
    }
  | {
      ok: false;
      reason: "already_fulfilled" | "in_progress";
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
};

type RedisClient = Pick<Redis, "del" | "get" | "set">;

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
    sessionName: "string",
    date: "string",
    location: "string",
    registrations: "string[]",
    time: "string",
    spotsAvailable: "number",
  },
  mappings: {
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

    claim = await claimFulfillment(checkoutSessionId, stripeEventId, undefined, dependencies);
    logger.info("Claim fulfillment result", {
      claimReason: claim.ok ? undefined : claim.reason,
      claimStatus: claim.ok ? claim.record.status : undefined,
    });

    if (!claim.ok) {
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

    validateCheckoutContext(context);
    logger.info("Validated checkout context", {
      internalCustomerId: context.internalCustomerId,
      internalSessionId: context.internalSessionId,
    });
    const registration = await createRegistration(context, event, dependencies);
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
  } catch (error: any) {
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

    if (existingRecord?.status === "fulfilled") {
      throw error;
    }

    const failureRecord: FulfillmentRecord =
      claim && claim.ok
        ? {
            ...claim.record,
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
      await releaseFulfillmentLock(claim.lockKey, dependencies);
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
    internalSessionId?: string;
  } = {},
  dependencies: FulfillmentDependencies = stripeFulfillmentDependencies,
): Promise<ClaimResult> {
  const redisClient = dependencies.getRedisClient();
  const recordKey = getFulfillmentRecordKey(checkoutSessionId);
  const lockKey = getFulfillmentLockKey(checkoutSessionId);
  const existingRecord = await readFulfillmentRecord(recordKey, dependencies);
  fulfillmentLogger.info("Checking fulfillment claim state", {
    checkoutSessionId,
    existingRecord,
    lockKey,
    recordKey,
    stripeEventId,
  });

  if (existingRecord?.status === "fulfilled") {
    fulfillmentLogger.info("Skipping claim: checkout already fulfilled", {
      checkoutSessionId,
      existingRecord,
    });
    return {
      ok: false,
      reason: "already_fulfilled",
      record: existingRecord,
    };
  }

  const locked = await redisClient.set(lockKey, stripeEventId, {
    ex: FIFTEEN_MINUTES_IN_SECONDS,
    nx: true,
  });
  fulfillmentLogger.info("Attempted fulfillment lock", {
    checkoutSessionId,
    locked,
    lockKey,
    stripeEventId,
  });

  if (!locked) {
    fulfillmentLogger.warn("Skipping claim: checkout already in progress", {
      checkoutSessionId,
      existingRecord,
    });
    return {
      ok: false,
      reason: "in_progress",
      record: existingRecord,
    };
  }

  const now = new Date().toISOString();
  const nextRecord: FulfillmentRecord = {
    attemptCount: (existingRecord?.attemptCount ?? 0) + 1,
    checkoutSessionId,
    claimedAt: existingRecord?.claimedAt ?? now,
    internalCustomerId: metadata.internalCustomerId ?? existingRecord?.internalCustomerId,
    internalSessionId: metadata.internalSessionId ?? existingRecord?.internalSessionId,
    lastAttemptAt: now,
    registrationId: existingRecord?.registrationId,
    status: "processing",
    stripeEventId,
  };

  await writeFulfillmentRecord(recordKey, nextRecord, dependencies);
  fulfillmentLogger.info("Stored processing fulfillment record", {
    checkoutSessionId,
    nextRecord,
    recordKey,
  });

  return {
    ok: true,
    lockKey,
    record: nextRecord,
    recordKey,
  };
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
  fulfillmentLogger.info("Validating checkout context", {
    checkoutSessionId,
    customerStripeId: context.customer.stripeID,
    internalCustomerId: context.internalCustomerId,
    internalSessionId: context.internalSessionId,
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

  if (context.session.spotsAvailable <= 0) {
    throw httpError({
      statusCode: 409,
      statusMessage: "Session Full",
      message: `Session ${context.internalSessionId} has no seats remaining`,
    });
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

  logger.info("Creating Airtable registration", {
    customerId: context.internalCustomerId,
    customerStripeId: context.stripeCustomerId,
    existingSessionRegistrationsCount: context.session.registrations?.length ?? 0,
    registrationName: context.registrationName,
    sessionId: context.internalSessionId,
  });

  const registration = await airtable.insert(registrationsTable, registrationPayload);

  logger.info("Created Airtable registration", {
    registrationId: registration.id,
    sessionId: context.internalSessionId,
  });

  const nextRegistrations = Array.from(
    new Set([...(context.session.registrations ?? []), registration.id]),
  );

  logger.info("Updating Airtable session registrations", {
    currentRegistrationsCount: context.session.registrations?.length ?? 0,
    nextRegistrationsCount: nextRegistrations.length,
    registrationId: registration.id,
    sessionId: context.internalSessionId,
  });

  try {
    const updatedSession = await airtable.update(sessionsTable, {
      id: context.internalSessionId,
      registrations: nextRegistrations,
    });
    logger.info("Updated Airtable session registrations", {
      registrationId: registration.id,
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
        registrationId: registration.id,
        sessionFieldNames,
        sessionId: context.internalSessionId,
        source: "stripe-fulfillment",
      },
      event,
      message: "Failed to update Airtable session registrations",
    });
    throw error;
  }

  return { id: registration.id };
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
    expand: ["customer", "payment_intent"],
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

async function writeFulfillmentRecord(
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
  dependencies: FulfillmentDependencies,
): Promise<void> {
  fulfillmentLogger.info("Deleting fulfillment lock", {
    lockKey,
  });
  await dependencies.getRedisClient().del(lockKey);
}

export function getFulfillmentRecordKey(checkoutSessionId: string): string {
  return `stripe:fulfillment:${checkoutSessionId}`;
}

export function getFulfillmentLockKey(checkoutSessionId: string): string {
  return `stripe:fulfillment-lock:${checkoutSessionId}`;
}
