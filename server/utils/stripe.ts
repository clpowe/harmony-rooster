import Stripe from "stripe";
import { createError, type H3Event } from "h3";

let stripeClient: Stripe | null = null;

// The fetch client works on Node (Vercel) and Workers; the SDK pins its own API version.
export function useServerStripe(event: H3Event): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const config = useRuntimeConfig(event);
  const key = typeof config.stripeSecretKey === "string" ? config.stripeSecretKey.trim() : "";
  if (!key) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Stripe secret key",
    });
  }

  stripeClient = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return stripeClient;
}
