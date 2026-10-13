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
  idempotencyKey: "receipt:cs_test_123",
};

function createDependencies(
  resendApiKey = "re_test",
  publicConfig: { contactFromEmail: string; receiptFromEmail?: string } = {
    contactFromEmail: "contact@harmonyroosters.com",
  },
) {
  const send = vi.fn().mockResolvedValue({
    data: { id: "email_123" },
    error: null,
  });

  const dependencies: ReceiptEmailDependencies = {
    getRuntimeConfig: () => ({
      resendApiKey,
      public: publicConfig,
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
    expect(send).toHaveBeenCalledExactlyOnceWith(
      {
        from: "contact@harmonyroosters.com",
        to: "customer@example.com",
        subject: "Receipt for Harmony Course - 2026-05-01",
        html: expect.stringContaining(receipt.receiptUrl!),
        text: expect.stringContaining(receipt.receiptUrl!),
      },
      { idempotencyKey: "receipt:cs_test_123" },
    );
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
      expect.anything(),
    );
  });

  it("forwards the idempotency key to Resend", async () => {
    const { dependencies, send } = createDependencies();

    await sendReceiptEmail({ ...receipt, idempotencyKey: "receipt:cs_other" }, event, dependencies);

    expect(send).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ to: receipt.to }), {
      idempotencyKey: "receipt:cs_other",
    });
  });

  it("prefers receiptFromEmail over contactFromEmail for the sender", async () => {
    const { dependencies, send } = createDependencies("re_test", {
      contactFromEmail: "contact@example.com",
      receiptFromEmail: "receipts@example.com",
    });

    await sendReceiptEmail(receipt, event, dependencies);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "receipts@example.com" }),
      expect.anything(),
    );
  });

  it("falls back to contactFromEmail, then the default sender", async () => {
    const withContact = createDependencies("re_test", {
      contactFromEmail: "contact@example.com",
    });
    await sendReceiptEmail(receipt, event, withContact.dependencies);
    expect(withContact.send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "contact@example.com" }),
      expect.anything(),
    );

    const withDefault = createDependencies("re_test", { contactFromEmail: "" });
    await sendReceiptEmail(receipt, event, withDefault.dependencies);
    expect(withDefault.send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "contact@harmonyroosters.com" }),
      expect.anything(),
    );
  });

  it("collapses CR/LF in the subject", async () => {
    const { dependencies, send } = createDependencies();

    await sendReceiptEmail(
      { ...receipt, sessionName: "Harmony\r\nBcc: evil@example.com" },
      event,
      dependencies,
    );

    const payload = send.mock.calls[0]![0] as { subject: string };
    expect(payload.subject).toBe("Receipt for Harmony Bcc: evil@example.com - 2026-05-01");
    expect(payload.subject).not.toMatch(/[\r\n]/);
  });

  it("throws before sending when the API key is missing", async () => {
    const { dependencies, send } = createDependencies("");

    await expect(sendReceiptEmail(receipt, event, dependencies)).rejects.toThrow(
      "Receipt email dependencies not configured",
    );

    expect(send).not.toHaveBeenCalled();
  });
});
