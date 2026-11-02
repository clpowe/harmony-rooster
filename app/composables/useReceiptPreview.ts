import { computed, ref } from "vue";
import type { RegistrationOutcome } from "../../shared/types/registration-outcome";

/**
 * Dev-only fixtures for designing /success without a real Stripe checkout.
 * Usage: /success?preview=confirmed (see `receiptPreviewStates` for options).
 */
const session: NonNullable<RegistrationOutcome["session"]> = {
  id: "preview_session",
  name: "Beginner Barbershop Harmony",
  date: "2026-11-14T00:00:00.000Z",
  time: "6:30 PM – 8:30 PM",
  location: "Harmony Hall, 123 Main St",
};

const paid: RegistrationOutcome["payment"] = {
  status: "paid",
  brand: "visa",
  last4: "4242",
  total: 4900,
  currency: "usd",
};

const fixtures: Record<string, RegistrationOutcome> = {
  confirmed: {
    registration: {
      state: "confirmed",
      title: "You're registered!",
      message: "We've emailed your confirmation. See you in class.",
      canRefresh: false,
    },
    registrant: { name: "Jordan Ellis" },
    payment: paid,
    session,
  },
  confirming: {
    registration: {
      state: "confirming",
      title: "Confirming your registration",
      message: "Your payment went through. We're finalizing your seat.",
      canRefresh: true,
    },
    registrant: { name: "Jordan Ellis" },
    payment: paid,
    session,
  },
  refunded: {
    registration: {
      state: "refunded",
      title: "Your payment was refunded",
      message: "This class was full, so we refunded your payment.",
      canRefresh: false,
    },
    registrant: { name: "Jordan Ellis" },
    payment: paid,
    session,
  },
  unavailable: {
    registration: {
      state: "unavailable",
      title: "Registration status unavailable",
      message:
        "We cannot verify your registration status right now. This does not mean it was cancelled. Please contact us if you need confirmation.",
      canRefresh: false,
    },
    registrant: { name: "Jordan Ellis" },
    payment: paid,
    session,
  },
  needs_attention: {
    registration: {
      state: "needs_attention",
      title: "We need to review your registration",
      message: "Our team will contact you shortly.",
      canRefresh: false,
    },
    registrant: { name: "Jordan Ellis" },
    payment: paid,
    session,
  },
  payment_incomplete: {
    registration: {
      state: "payment_incomplete",
      title: "Payment not completed",
      message: "Your payment didn't go through. No charge was made.",
      canRefresh: false,
    },
    registrant: { name: "Jordan Ellis" },
    payment: { ...paid, status: "unpaid", brand: null, last4: null },
    session,
  },
};

export const receiptPreviewStates = [...Object.keys(fixtures), "loading", "error"];

export function useReceiptPreview(state: string) {
  const loading = state === "loading";
  const failed = state === "error";
  return {
    data: ref<RegistrationOutcome | null>(
      fixtures[state] ?? (loading || failed ? null : fixtures.confirmed!),
    ),
    error: ref(failed ? new Error("Preview error") : null),
    pending: ref(loading),
    initialLoading: computed(() => loading),
    token: ref<string | null>("preview-token"),
    refresh: async () => {},
    autoRefreshFinished: ref(false),
  };
}
