import { useServerStripe } from "#stripe/server";
import { AirtableTs, type Table } from "airtable-ts";
import * as z from "zod";
import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_IDS,
} from "../../shared/constants/airtable";

const registrationSchema = z.object({
  first_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phonenumber: z
    .string({ required_error: "Phone number is required" })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number",
    ),
  sessionId: z.string().min(1, "Session ID is required"),
});

type SessionRecord = {
  id: string;
  cost: number[];
  productID: string[];
  sessionName: string;
  date: string;
  location: string;
  time: string;
};

type CustomerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  stripeID: string | null;
};

const sessionsTable: Table<SessionRecord> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: {
    cost: "number[]",
    productID: "string[]",
    sessionName: "string",
    date: "string",
    location: "string",
    time: "string",
  },
  mappings: {
    cost: "cost",
    productID: "productID",
    sessionName: "session-name",
    date: "date",
    location: "location",
    time: "time",
  },
};

const customersTable: Table<CustomerRecord> = {
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

function escapeAirtableFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const stripe = await useServerStripe(event);

  if (!config.airtableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  const body = await readBody(event);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parsed.error.issues.map((i) => i.message).join("; "),
    });
  }

  const { first_name, last_name, email, phonenumber, sessionId } = parsed.data;
  const db = new AirtableTs({ apiKey: config.airtableKey });

  let sessionRecord: SessionRecord;
  try {
    sessionRecord = await db.get(sessionsTable, sessionId);
  } catch (error: any) {
    throw createError({
      statusCode: 404,
      statusMessage: "Session Not Found",
      message: error?.message ?? "Session not found",
    });
  }

  const escapedEmail = escapeAirtableFormulaValue(email.toLowerCase().trim());
  const existingUsers = await db.scan(customersTable, {
    maxRecords: 1,
    filterByFormula: `{email}="${escapedEmail}"`,
  });

  let user = existingUsers[0];
  let customerID = user?.stripeID ?? undefined;

  if (!user) {
    user = await db.insert(customersTable, {
      first_name,
      last_name,
      email: email.toLowerCase().trim(),
      phone: phonenumber,
    });

    const customer = await stripe.customers.create({
      email,
      name: `${first_name} ${last_name}`,
      phone: phonenumber,
      metadata: {
        sessionId: user.id,
      },
    });

    user = await db.update(customersTable, {
      id: user.id,
      stripeID: customer.id,
    });
    customerID = customer.id;
  } else if (!customerID) {
    const customer = await stripe.customers.create({
      email,
      name: `${first_name} ${last_name}`,
      phone: phonenumber,
      metadata: {
        sessionId: user.id,
      },
    });

    user = await db.update(customersTable, {
      id: user.id,
      stripeID: customer.id,
    });
    customerID = customer.id;
  }

  const productCost = sessionRecord.cost[0];
  const productID = sessionRecord.productID[0];

  if (!productCost || !productID) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Session is missing Stripe product/cost configuration",
    });
  }

  const successUrl = `${config.public.siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${config.public.siteUrl}/cancel`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer: customerID,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(productCost * 100),
          product: productID,
        },
        quantity: 1,
      },
    ],
    metadata: {
      sessionID: sessionRecord.id,
      customerID: user.id,
      first_name,
      last_name,
      email,
      courseName: sessionRecord.sessionName,
      courseDate: sessionRecord.date,
      courseLocation: sessionRecord.location,
      courseTime: sessionRecord.time,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!checkoutSession.url) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Session URL is null",
    });
  }

  return {
    url: checkoutSession.url,
  };
});
