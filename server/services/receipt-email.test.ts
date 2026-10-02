import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { H3Event } from "h3";
import {
  sendReceiptEmail,
  type ReceiptEmailDependencies,
  type ReceiptEmailInput,
} from "./receipt-emails";

const renderEmail = vi.hoisted(() =>
  vi.fn(
    async (
      _component: unknown,
      props: { receiptUrl?: string | null },
      options?: { plainText?: boolean },
    ) => {
      if (options?.plainText) {
        return props.receiptUrl ? `View receipt: ${props.receiptUrl}` : "Receipt email";
      }

      return props.receiptUrl
        ? `<a href="${props.receiptUrl}">View Stripe receipt</a>`
        : "<p>Receipt email</p>";
    },
  ),
);

vi.mock("@vue-email/render", () => ({
  render: renderEmail,
}));

const event = {} as H3Event;

const receipt: ReceiptEmailInput = {
  to: "customer@example.com",
  firstName: "Taylor",
  sessionName: "Harmony Course",
  sessionDate: "2026-05-01",
  sessionTime: "1:00 PM",
  sessionLocation: "Nashville",
  amountMinor: 12000,
  currency: "usd",
  receiptUrl: "https://pay.stripe.com/receipts/test_receipt",
  registrationId: "reg_123",
};

function createDependencies(resendApiKey = "re_test") {
  const send = vi.fn().mockResolvedValue({
    data: { id: "email_123" },
    error: null,
  });

  const dependencies: ReceiptEmailDependencies = {
    getRuntimeConfig: () => ({
      resendApiKey,
      public: {
        contactFromEmail: "contact@harmonyroosters.com",
      },
    }),
    getResendClient: () => ({
      emails: { send },
    }),
  };

  return { dependencies, send };
}

describe("sendReceiptEmail", () => {
  beforeEach(() => {
    renderEmail.mockClear();
  });

  it("renders the receipt, sends it, and returns the email ID", async () => {
    const { dependencies, send } = createDependencies();

    const result = await sendReceiptEmail(receipt, event, dependencies);

    expect(result).toEqual({ id: "email_123" });
    expect(renderEmail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        firstName: "Taylor",
        sessionName: "Harmony Course",
        amountFormatted: "$120.00",
        registrationId: "reg_123",
        supportEmail: "contact@harmonyroosters.com",
      }),
    );
    expect(send).toHaveBeenCalledExactlyOnceWith({
      from: "contact@harmonyroosters.com",
      to: "customer@example.com",
      subject: "Receipt for Harmony Course - 2026-05-01",
      html: expect.stringContaining(receipt.receiptUrl!),
      text: expect.stringContaining(receipt.receiptUrl!),
    });
  });

  it("throws when Resend returns an error", async () => {
    const { dependencies, send } = createDependencies();
    send.mockResolvedValueOnce({
      data: null,
      error: { message: "API down" },
    });

    await expect(sendReceiptEmail(receipt, event, dependencies)).rejects.toThrow(
      "Resend error: API down",
    );
  });

  it("throws when Resend returns no email ID", async () => {
    const { dependencies, send } = createDependencies();
    send.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await expect(sendReceiptEmail(receipt, event, dependencies)).rejects.toThrow(
      "Resend returned no email ID",
    );
  });

  it("sends a receipt without a Stripe receipt URL", async () => {
    const { dependencies, send } = createDependencies();

    await sendReceiptEmail({ ...receipt, receiptUrl: null }, event, dependencies);

    expect(send).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        html: "<p>Receipt email</p>",
        text: "Receipt email",
      }),
    );
  });

  it("throws before sending when the API key is missing", async () => {
    const { dependencies, send } = createDependencies("");

    await expect(sendReceiptEmail(receipt, event, dependencies)).rejects.toThrow(
      "Receipt email dependencies not configured",
    );

    expect(send).not.toHaveBeenCalled();
  });
});
