import { Resend } from "resend";
import { render } from "@vue-email/render";
import { defineComponent, h, type PropType } from "vue";
import {
  type CheckoutContext,
  type FulfillmentDependencies,
  getFulfillmentRecordKey,
  readFulfillmentRecord,
  stripeFulfillmentDependencies,
  writeFulfillmentRecord,
} from "./stripe-fulfillment";

type H3Event = any;

const ReceiptEmail = defineComponent({
  name: "ReceiptEmail",
  props: {
    amountFormatted: {
      default: "",
      type: String,
    },
    firstName: {
      required: true,
      type: String,
    },
    receiptUrl: {
      default: null,
      type: String as PropType<string | null>,
    },
    registrationId: {
      required: true,
      type: String,
    },
    sessionDate: {
      required: true,
      type: String,
    },
    sessionLocation: {
      required: true,
      type: String,
    },
    sessionName: {
      required: true,
      type: String,
    },
    sessionTime: {
      required: true,
      type: String,
    },
    supportEmail: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    return () =>
      h("html", [
        h("body", [
          h("h1", `Receipt for ${props.sessionName}`),
          h("p", `Hi ${props.firstName}, your registration is confirmed.`),
          h("p", `Date: ${props.sessionDate}`),
          h("p", `Time: ${props.sessionTime}`),
          h("p", `Location: ${props.sessionLocation}`),
          h("p", `Amount paid: ${props.amountFormatted}`),
          h("p", `Registration ID: ${props.registrationId}`),
          props.receiptUrl
            ? h("p", [h("a", { href: props.receiptUrl }, "View Stripe receipt")])
            : null,
          h("p", `Questions? Contact ${props.supportEmail}.`),
        ]),
      ]);
  },
});

export type ReceiptEmailDependencies = FulfillmentDependencies & {
  getResendClient: (apiKey: string) => Pick<Resend, "emails">;
};

export const receiptEmailDependencies: ReceiptEmailDependencies = {
  createAirtableClient: (apiKey) => stripeFulfillmentDependencies.createAirtableClient(apiKey),
  getRedisClient: () => stripeFulfillmentDependencies.getRedisClient(),
  getRuntimeConfig: (event) => stripeFulfillmentDependencies.getRuntimeConfig(event),
  getStripeClient: (event) => stripeFulfillmentDependencies.getStripeClient(event),
  getResendClient: (apiKey) => new Resend(apiKey),
};

export async function sendReceiptEmail(
  context: CheckoutContext,
  registrationId: string,
  event: H3Event,
  deps: ReceiptEmailDependencies = receiptEmailDependencies,
): Promise<{ id: string } | null> {
  const config = deps.getRuntimeConfig(event);
  if (!config.resendApiKey) {
    throw new Error("Receipt email dependencies not configured");
  }

  // Idempotency: bail if already sent
  const recordKey = getFulfillmentRecordKey(context.checkoutSession.id);
  const record = await readFulfillmentRecord(recordKey, deps);
  if (record?.receiptSentAt) return null;

  // Pull receipt url from expanded charge when Stripe supplied it.
  const pi = context.checkoutSession.payment_intent;
  const charge = pi && typeof pi !== "string" ? pi.latest_charge : null;
  const receiptUrl = charge && typeof charge !== "string" ? charge.receipt_url : null;

  const session_name = context.session.sessionName;
  const session_date = context.session.date;
  const subject = `Receipt for ${session_name} - ${session_date}`;

  const props = {
    firstName: context.customer.first_name,
    sessionName: session_name,
    sessionDate: session_date,
    sessionTime: context.session.time,
    sessionLocation: context.session.location,
    amountFormatted: formatAmount(
      context.checkoutSession.amount_total,
      context.checkoutSession.currency,
    ),
    receiptUrl,
    registrationId,
    supportEmail: config.contactFromEmail,
  };

  const [html, text] = await Promise.all([
    render(ReceiptEmail as any, props),
    render(ReceiptEmail as any, props, { plainText: true }),
  ]);

  const resend = deps.getResendClient(config.resendApiKey);
  const response = await resend.emails.send({
    from: "contact@harmonyrooster.com",
    to: context.customer.email,
    subject,
    html,
    text,
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }

  if (record) {
    await writeFulfillmentRecord(
      recordKey,
      { ...record, receiptSentAt: new Date().toISOString() },
      deps,
    );
  }

  return { id: response.data?.id ?? "" };
}

function formatAmount(amountMinor: number | null, currency: string | null): string {
  if (amountMinor == null || !currency) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}
