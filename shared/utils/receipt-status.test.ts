import { describe, expect, it } from "vite-plus/test";
import type { RegistrationState } from "../types/registration-outcome";
import { getReceiptPaymentLabel, getReceiptStatus } from "./receipt-status";

describe("receipt status presentation", () => {
  it.each([
    ["payment_pending", "unpaid", "Confirming payment", "pending", true],
    ["payment_incomplete", "unpaid", "Payment incomplete", "warning", false],
    ["confirming", "paid", "Confirming registration", "pending", true],
    ["confirmed", "paid", "Payment confirmed", "success", false],
    ["refund_pending", "paid", "Refund pending", "warning", false],
    ["refunded", "paid", "Payment refunded", "warning", false],
    ["needs_attention", "paid", "Registration needs attention", "warning", false],
    ["unavailable", "paid", "Registration status unavailable", "warning", false],
  ] as const)(
    "labels %s independently of checkout payment status",
    (state, payment, label, tone, busy) => {
      expect(getReceiptStatus(state, payment)).toEqual({ label, tone, busy });
    },
  );

  it("does not infer a paid checkout from a confirmed registration", () => {
    for (const payment of ["unpaid", "unknown", undefined]) {
      expect(getReceiptStatus("confirmed", payment)).toEqual({
        label: "Payment status unavailable",
        tone: "warning",
        busy: false,
      });
    }
    expect(getReceiptStatus("confirmed", "no_payment_required")).toEqual({
      label: "No payment required",
      tone: "neutral",
      busy: false,
    });
  });

  it("only uses the green confirmation for paid, fulfilled registrations", () => {
    const states: RegistrationState[] = [
      "payment_pending",
      "payment_incomplete",
      "confirming",
      "confirmed",
      "refund_pending",
      "refunded",
      "needs_attention",
      "unavailable",
    ];
    for (const state of states) {
      for (const payment of ["paid", "unpaid", "no_payment_required", "unknown"]) {
        expect(getReceiptStatus(state, payment).tone === "success").toBe(
          state === "confirmed" && payment === "paid",
        );
      }
    }
  });

  it("shows a neutral unavailable state before an outcome is known", () => {
    expect(getReceiptStatus()).toEqual({
      label: "Status unavailable",
      tone: "warning",
      busy: false,
    });
  });

  it("does not describe a refund or payment needing review as received", () => {
    expect(getReceiptPaymentLabel("refund_pending", "paid")).toBe("Refund pending");
    expect(getReceiptPaymentLabel("refunded", "paid")).toBe("Refunded");
    expect(getReceiptPaymentLabel("needs_attention", "paid")).toBe("Review required");
    expect(getReceiptPaymentLabel("unavailable", "paid")).toBe("Payment received");
    expect(getReceiptPaymentLabel("payment_pending", "unpaid")).toBe("Not yet paid");
  });
});
