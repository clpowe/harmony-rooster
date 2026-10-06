import { useServerStripe } from "#stripe/server";
import { AirtableTs } from "airtable-ts";
import * as z from "zod";
import { issueReceiptAccess } from "../services/registration-outcome";
import {
  checkoutSessionsTable,
  customersTable,
  type CheckoutSessionRecord,
} from "../data/airtable-tables";

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
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number"),
  sessionId: z.string().min(1, "Session ID is required"),
});

function getConfiguredSiteOrigin(siteUrl: string | undefined): string | null {
  const trimmedSiteUrl = siteUrl?.trim();

  if (!trimmedSiteUrl) {
    return null;
  }

  try {
    return new URL(trimmedSiteUrl).origin;
  } catch {
    return null;
  }
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
  const normalizedEmail = email.toLocaleLowerCase().trim();

  const db = new AirtableTs({ apiKey: config.airtableKey });

  let sessionRecord: CheckoutSessionRecord;
  try {
    sessionRecord = await db.get(checkoutSessionsTable, sessionId);
  } catch (error: any) {
    throw createError({
      statusCode: 404,
      statusMessage: "Session Not Found",
      message: error?.message ?? "Session not found",
    });
  }

  const user = await db.insert(customersTable, {
    first_name,
    last_name,
    email: normalizedEmail,
    phone: phonenumber,
  });

  const customer = await stripe.customers.create({
    email: normalizedEmail,
    name: `${first_name} ${last_name}`,
    phone: phonenumber,
    metadata: {
      sessionId: user.id,
    },
  });

  await db.update(customersTable, {
    id: user.id,
    stripeID: customer.id,
  });

  const productCost = sessionRecord.cost[0];
  const productID = sessionRecord.productID[0];

  if (!productCost || !productID) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Session is missing Stripe product/cost configuration",
    });
  }

  const baseUrl = getConfiguredSiteOrigin(config.public.siteUrl) ?? getRequestURL(event).origin;
  const receiptAccess = issueReceiptAccess();
  const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}#receipt_token=${receiptAccess.token}`;
  const cancelUrl = `${baseUrl}/cancel`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
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
      receipt_token_hash: receiptAccess.tokenHash,
      sessionID: sessionRecord.id,
      customerID: user.id,
      first_name,
      last_name,
      email: normalizedEmail,
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
