import { Resend } from "resend";
import { render } from "@vue-email/render";
import { defineComponent, h, type PropType } from "vue";
import type { H3Event } from "h3";

export type ReceiptEmailInput = {
  to: string;
  firstName: string;
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  sessionLocation: string;
  amountMinor: number | null;
  currency: string | null;
  receiptUrl: string | null;
  registrationId: string;
  idempotencyKey: string;
};

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

export type ReceiptEmailDependencies = {
  getRuntimeConfig: (event: H3Event) => {
    resendApiKey: string;
    public: {
      contactFromEmail: string;
      receiptFromEmail?: string;
    };
  };
  getResendClient: (apiKey: string) => {
    emails: Pick<Resend["emails"], "send">;
  };
};

const receiptEmailDependencies: ReceiptEmailDependencies = {
  getRuntimeConfig: (event) => useRuntimeConfig(event),
  getResendClient: (apiKey) => new Resend(apiKey),
};

export async function sendReceiptEmail(
  receipt: ReceiptEmailInput,
  event: H3Event,
  deps: ReceiptEmailDependencies = receiptEmailDependencies,
): Promise<{ id: string }> {
  const config = deps.getRuntimeConfig(event);

  if (!config.resendApiKey) {
    throw new Error("Receipt email dependencies not configured");
  }

  const props = {
    firstName: receipt.firstName,
    sessionName: receipt.sessionName,
    sessionDate: receipt.sessionDate,
    sessionTime: receipt.sessionTime,
    sessionLocation: receipt.sessionLocation,
    amountFormatted: formatAmount(receipt.amountMinor, receipt.currency),
    receiptUrl: receipt.receiptUrl,
    registrationId: receipt.registrationId,
    supportEmail: config.public.contactFromEmail || "contact@harmonyroosters.com",
  };

  const [html, text] = await Promise.all([
    render(ReceiptEmail as any, props),
    render(ReceiptEmail as any, props, { plainText: true }),
  ]);

  const resend = deps.getResendClient(config.resendApiKey);
  const payload = {
    from:
      config.public.receiptFromEmail ||
      config.public.contactFromEmail ||
      "contact@harmonyroosters.com",
    to: receipt.to,
    subject: `Receipt for ${receipt.sessionName} - ${receipt.sessionDate}`.replace(/[\r\n]+/g, " "),
    html,
    text,
  };
  const response = await resend.emails.send(payload, {
    idempotencyKey: receipt.idempotencyKey,
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }

  if (!response.data?.id) {
    throw new Error("Resend returned no email ID");
  }

  return { id: response.data.id };
}

function formatAmount(amountMinor: number | null, currency: string | null): string {
  if (amountMinor == null || !currency) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}
