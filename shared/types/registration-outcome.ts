export type RegistrationState =
  | "payment_pending"
  | "payment_incomplete"
  | "confirming"
  | "confirmed"
  | "refund_pending"
  | "refunded"
  | "needs_attention"
  | "unavailable";

export type RegistrationOutcome = {
  registration: {
    state: RegistrationState;
    title: string;
    message: string;
    canRefresh: boolean;
  };
  payment: {
    status: string;
    brand: string | null;
    last4: string | null;
    total: number | null;
    currency: string | null;
  };
  session: {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
  } | null;
};
