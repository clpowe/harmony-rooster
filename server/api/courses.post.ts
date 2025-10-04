import AIRTABLE from "airtable";
import * as z from "zod";
import { useServerStripe } from "#stripe/server";

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

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event);

  const config = useRuntimeConfig(event);

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
    console.log(parsed.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parsed.error.issues.map((i) => i.message).join("; "),
    });
  }

  const { first_name, last_name, email, phonenumber, sessionId } = parsed.data;

  AIRTABLE.configure({ apiKey: config.airtableKey });
  const base = AIRTABLE.base("apptCFjP3Ns4FdGGi");

  // Verify session exists
  const [sessionError, sessionRecord] = await catchError(
    base("Sessions").find(sessionId),
  );
  if (sessionError) {
    throw createError({
      statusCode: 404,
      statusMessage: "Session Not Found",
      message: sessionError.message,
    });
  }

  const [userError, userRecord] = await catchError(
    base("Customers")
      .select({
        filterByFormula: `{email}="${email}"`,
      })
      .all(),
  );
  if (userError) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found",
    });
  }

  let customerID: string | undefined;
  let user: any | undefined;

  if (userRecord.length < 1) {
    user = await base("Customers").create({
      first_name: first_name,
      last_name: last_name,
      email: email,
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
    await base("Customers").update(user.id, {
      stripeID: customer.id,
    });

    customerID = customer.id;
  } else {
    user = userRecord[0];
    customerID = user.fields.stripeID;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerID,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: sessionRecord.fields.cost[0] * 100,
          product: sessionRecord.fields.productID[0],
          product_data: {
            name: sessionRecord.fields.name,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      sessionID: sessionRecord.id,
      customerID: user?.id,
    },
    success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/cancel`,
  });

  if (session.url == null) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Session URL is null",
    });
  }

  return {
    url: session.url,
  };
});
