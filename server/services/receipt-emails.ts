import { Resend } from "resend";
import { render } from "@vue-email/render";
import { ReceiptEmail } from "./receipt-email-template";
import type { H3Event } from "h3";

const PRODUCTION_SITE_URL = "https://www.harmonyroosters.com";

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

export type ReceiptEmailDependencies = {
  getRuntimeConfig: (event: H3Event) => {
    resendApiKey: string;
    public: {
      contactFromEmail: string;
      receiptFromEmail?: string;
      siteUrl?: string;
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

  const { subject, html, text } = await renderReceiptEmail(
    receipt,
    config.public.contactFromEmail || "contact@harmonyroosters.com",
    config.public.siteUrl || PRODUCTION_SITE_URL,
  );

  const resend = deps.getResendClient(config.resendApiKey);
  const payload = {
    from:
      config.public.receiptFromEmail ||
      config.public.contactFromEmail ||
      "contact@harmonyroosters.com",
    to: receipt.to,
    subject,
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

/** Renders the receipt email without sending it. Used by sendReceiptEmail and the dev preview route. */
export async function renderReceiptEmail(
  receipt: Omit<ReceiptEmailInput, "to" | "idempotencyKey">,
  supportEmail: string,
  siteUrl: string,
): Promise<{ subject: string; html: string; text: string }> {
  const props = {
    firstName: receipt.firstName,
    sessionName: receipt.sessionName,
    sessionDate: receipt.sessionDate,
    sessionTime: receipt.sessionTime,
    sessionLocation: receipt.sessionLocation,
    amountFormatted: formatAmount(receipt.amountMinor, receipt.currency),
    receiptUrl: receipt.receiptUrl,
    registrationId: receipt.registrationId,
    supportEmail,
    logoUrl: new URL("/email/logo.png", siteUrl).href,
  };

  const [html, text] = await Promise.all([
    render(ReceiptEmail as any, props),
    render(ReceiptEmail as any, props, { plainText: true }),
  ]);

  return {
    subject: `Receipt for ${receipt.sessionName} - ${receipt.sessionDate}`.replace(/[\r\n]+/g, " "),
    html,
    text,
  };
}

function formatAmount(amountMinor: number | null, currency: string | null): string {
  if (amountMinor == null || !currency) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}
