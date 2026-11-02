import { renderReceiptEmail } from "../../services/receipt-emails";

/**
 * Dev-only preview of the receipt email. Renders the real template with fixture data; never sends.
 * HTML:       /__dev/receipt-email
 * Plain text: /__dev/receipt-email?format=text
 * No receipt link: /__dev/receipt-email?receiptUrl=none
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404 });
  }

  const query = getQuery(event);

  const { subject, html, text } = await renderReceiptEmail(
    {
      firstName: "Jordan",
      sessionName: "Beginner Barbershop Harmony",
      sessionDate: "Saturday, November 14, 2026",
      sessionTime: "6:30 PM – 8:30 PM",
      sessionLocation: "Harmony Hall, 123 Main St",
      amountMinor: 4900,
      currency: "usd",
      receiptUrl:
        query.receiptUrl === "none" ? null : "https://pay.stripe.com/receipts/preview_receipt",
      registrationId: "rec_preview123",
    },
    "contact@harmonyroosters.com",
    getRequestURL(event).origin,
  );

  setResponseHeader(event, "X-Email-Subject", encodeURIComponent(subject));

  if (query.format === "text") {
    setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
    return `Subject: ${subject}\n\n${text}`;
  }

  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
  return html;
});
