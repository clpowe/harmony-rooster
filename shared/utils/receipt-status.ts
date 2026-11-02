import type { RegistrationState } from "../types/registration-outcome";

export type ReceiptStatus = {
  label: string;
  tone: "success" | "pending" | "warning" | "neutral";
  busy: boolean;
};

/** Payment and fulfillment are separate: a paid checkout can still need a refund. */
export function getReceiptStatus(
  registrationState?: RegistrationState,
  paymentStatus?: string,
): ReceiptStatus {
  const warning = (label: string): ReceiptStatus => ({ label, tone: "warning", busy: false });
  const pending = (label: string): ReceiptStatus => ({ label, tone: "pending", busy: true });

  switch (registrationState) {
    case "refund_pending":
      return warning("Refund pending");
    case "refunded":
      return warning("Payment refunded");
    case "needs_attention":
      return warning("Registration needs attention");
    case "unavailable":
      return warning("Registration status unavailable");
    case "payment_incomplete":
      return warning("Payment incomplete");
    case "payment_pending":
    case "confirming":
      return pending(
        paymentStatus === "paid" || paymentStatus === "no_payment_required"
          ? "Confirming registration"
          : "Confirming payment",
      );
    case "confirmed":
      if (paymentStatus === "paid") {
        return { label: "Payment confirmed", tone: "success", busy: false };
      }
      if (paymentStatus === "no_payment_required") {
        return { label: "No payment required", tone: "neutral", busy: false };
      }
      return warning("Payment status unavailable");
    default:
      return warning("Status unavailable");
  }
}

/** A summary label must not describe refunded or unverified funds as paid. */
export function getReceiptPaymentLabel(
  registrationState?: RegistrationState,
  paymentStatus?: string,
): string {
  if (registrationState === "refund_pending") return "Refund pending";
  if (registrationState === "refunded") return "Refunded";
  if (registrationState === "needs_attention") return "Review required";
  if (paymentStatus === "paid") return "Payment received";
  if (paymentStatus === "no_payment_required") return "No payment required";
  if (registrationState === "payment_incomplete") return "Not completed";
  if (paymentStatus === "unpaid") return "Not yet paid";
  return "Unavailable";
}
