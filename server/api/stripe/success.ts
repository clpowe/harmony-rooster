import { useServerStripe } from "#stripe/server";

import AIRTABLE from "airtable";

type Session = {
  id: string;
  session_name: string;
  date: string;
  time: string;
  capacity: number;
  spots_available: number;
  location: string;
};

type Course = {
  id: string;
  course_name: string;
  description: string;
  duration: number;
  cost: number;
  sessions?: Session[];
};

const config = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event);

  console.log("Session ID:", session_id);

  if (!session_id) {
    throw createError({
      statusCode: 400,
      message: "Session ID is required",
    });
  }

  const stripe = await useServerStripe(event);

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: [
      "line_items",
      "customer",
      "payment_intent",
      "payment_intent.payment_method",
    ], // Expand any needed data
  });

  return {
    payment: {
      brand: session.payment_intent?.payment_method?.card?.brand,
      last4: session.payment_intent?.payment_method?.card?.last4,
    },
    total: session.amount_total,
    metadata: session.metadata,
  };
});
