import { useServerStripe } from "#stripe/server";
import { AirtableTs, type Table } from "airtable-ts";
import type Stripe from "stripe";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "@constants/airtable";

const sessionsTable: Table<StripeWebhookSessionRecord> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: {},
};

const customersTable: Table<StripeWebhookCustomerRecord> = {
  name: "customer",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.CUSTOMERS,
  schema: {},
};

const registrationsTable: Table<StripeWebhookRegistrationRecord> = {
  name: "registration",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.REGISTRATIONS,
  schema: {
    Name: "string",
    Session: "string[]",
    Customer: "string[]",
  },
};

function isRegistrationEvent(
  event: Stripe.Event,
): event is StripeWebhookRegistrationEvent {
  return (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.async_payment_failed"
  );
}

export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!config.airtableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  console.log("Stripe webhook received");
  const stripe = await useServerStripe(event);
  const db = new AirtableTs({ apiKey: config.airtableKey });
  const body = await readRawBody(event);
  const signature = getHeader(event, "stripe-signature");

  if (!body) {
    return { error: "Invalid request body" };
  }

  if (!signature) {
    return { error: "Invalid stripe-signature" };
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripeWebhookSecretKey,
    );
  } catch (err) {
    const error = createError({
      statusCode: 400,
      message: `Webhook error: ${err}`,
    });
    return sendError(event, error);
  }

  if (!isRegistrationEvent(stripeEvent)) {
    return { received: true };
  }

  await handleCourseRegistration(stripeEvent.data.object.id);
  return { received: true };

  async function handleCourseRegistration(checkoutSessionID: string) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      checkoutSessionID,
      {
        expand: ["line_items"],
      },
    );

    const sessionID = checkoutSession.metadata?.sessionID;
    const customerID = checkoutSession.metadata?.customerID;
    const firstName = checkoutSession.metadata?.first_name?.trim() ?? "";
    const lastName = checkoutSession.metadata?.last_name?.trim() ?? "";
    const Name = `${firstName} ${lastName}`.trim();

    if (!sessionID || !customerID || !Name) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing required checkout metadata for registration",
      });
    }

    // Validate linked records exist before creating the registration row.
    await db.get(sessionsTable, sessionID);
    await db.get(customersTable, customerID);

    await db.insert(registrationsTable, {
      Name,
      Session: [sessionID],
      Customer: [customerID],
    });
  }
});
