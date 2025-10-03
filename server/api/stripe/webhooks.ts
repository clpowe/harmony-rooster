import AIRTABLE from "airtable";
import * as z from "zod";
import { useServerStripe } from "#stripe/server";

const config = useRuntimeConfig();
AIRTABLE.configure({ apiKey: config.airtableKey });
const base = AIRTABLE.base("apptCFjP3Ns4FdGGi");

export default eventHandler(async (event) => {
  console.log("Stripe webhook received");
  const stripe = await useServerStripe(event);
  const body = await readRawBody(event);
  let stripeEvent: any = body;
  let status;

  const signature = getHeader(event, "stripe-signature");

  if (!body) {
    return { error: "Invalid request body" };
  }

  if (!signature) {
    return { error: "Invalid stripe-signature" };
  }

  try {
    // 3
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

  switch (stripeEvent.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
      await handleCourseRegistration(stripeEvent.data.object.id);
      break;
  }

  async function handleCourseRegistration(checkoutSessionID: string) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      checkoutSessionID,
      {
        expand: ["line_items"],
      },
    );

    console.log(checkoutSession.metadata);

    const sessionID = checkoutSession.metadata?.sessionID;
    const customerID = checkoutSession.metadata?.customerID;

    let session = await base("Sessions")
      .select({
        maxRecords: 1,
        filterByFormula: `id = '${sessionID}'`,
      })
      .all();

    let customer = await base("Customers")
      .select({
        maxRecords: 1,
        filterByFormula: `id = '${customerID}'`,
      })
      .all();

    await base("Registrations").create([
      {
        fields: {
          Name: customer[0].fields.Name,
          Session: [session[0].id],
          Customer: [customer[0].id],
        },
      },
    ]);
  }
});
