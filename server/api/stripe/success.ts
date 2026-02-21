import { useServerStripe } from "#stripe/server";
import { AirtableTs, type Table } from "airtable-ts";
import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_IDS,
} from "../../../shared/constants/airtable";

type SessionRecord = {
  id: string;
  "session-name": string;
  date: string;
  time: string;
  location: string;
};

const sessionsTable: Table<SessionRecord> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: {
    "session-name": "string",
    date: "string",
    time: "string",
    location: "string",
  },
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const rawSessionID = getQuery(event).session_id;
  const sessionID =
    typeof rawSessionID === "string"
      ? rawSessionID
      : Array.isArray(rawSessionID)
        ? rawSessionID[0]
        : undefined;

  if (!sessionID) {
    throw createError({
      statusCode: 400,
      message: "Session ID is required",
    });
  }

  if (!config.airtableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  const stripe = await useServerStripe(event);
  const db = new AirtableTs({ apiKey: config.airtableKey });

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionID, {
    expand: ["payment_intent", "payment_intent.payment_method"],
  });

  const paymentIntent =
    checkoutSession.payment_intent &&
    typeof checkoutSession.payment_intent !== "string"
      ? checkoutSession.payment_intent
      : null;

  const paymentMethod =
    paymentIntent?.payment_method &&
    typeof paymentIntent.payment_method !== "string"
      ? paymentIntent.payment_method
      : null;

  const linkedSessionID = checkoutSession.metadata?.sessionID;
  const airtableSession = linkedSessionID
    ? await db.get(sessionsTable, linkedSessionID)
    : null;

  return {
    payment: {
      brand: paymentMethod?.card?.brand ?? null,
      last4: paymentMethod?.card?.last4 ?? null,
    },
    total: checkoutSession.amount_total,
    metadata: checkoutSession.metadata,
    session: airtableSession
      ? {
          id: airtableSession.id,
          name: airtableSession["session-name"],
          date: airtableSession.date,
          time: airtableSession.time,
          location: airtableSession.location,
        }
      : null,
  };
});
