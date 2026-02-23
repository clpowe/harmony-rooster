import { useServerStripe } from "#stripe/server";
import { AirtableTs, type Table } from "airtable-ts";
import Stripe from "stripe";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "@constants/airtable";
import type { StripeWebhookRegistrationRecord } from "@types/stripe-webhooks";

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const stripe = await useServerStripe(event);
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

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecretKey,
    );
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Webhook Error: ${err.message}`,
    });
  }

  if (
    stripeEvent.type === "checkout.session.completed" ||
    stripeEvent.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = stripeEvent.data.object;

    // For checkout.session.completed, only proceed if payment is confirmed.
    // Async payment methods will trigger async_payment_succeeded separately.
    if (
      stripeEvent.type === "checkout.session.completed" &&
      session.payment_status === "unpaid"
    ) {
      console.log(
        `Skipping registration for session ${session.id}: payment still processing`,
      );
      return { received: true };
    }

    // Extract metadata
    const { sessionID, customerID, first_name, last_name, email } =
      session.metadata || {};

    if (!sessionID || !customerID) {
      console.warn("Missing metadata in session:", session.id);
      return { received: true };
    }

    if (!config.airtableKey) {
      console.error("Missing Airtable API key");
      throw createError({
        statusCode: 500,
        statusMessage: "Server Misconfiguration",
        message: "Missing Airtable API key",
      });
    }

    if (!airtableClient) {
      airtableClient = new AirtableTs({ apiKey: config.airtableKey });
    }
    const db = airtableClient;

    try {
      await db.insert(registrationsTable, {
        Name: `${first_name} ${last_name} - ${sessionID}`,
        Status: "Paid",
        Session: [sessionID],
        Customer: [customerID],
      });
      console.log(`Registered user ${email} for session ${sessionID}`);
    } catch (error: any) {
      console.error("Error creating registration in Airtable:", error);
      throw createError({
        statusCode: 500,
        message: "Failed to create registration",
      });
    }
  }

  return { received: true };
});
