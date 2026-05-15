import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const sendEmail = vi.fn();
const storageState = new Map<string, unknown>();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendEmail,
    };
  },
}));

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("useRuntimeConfig", () => ({
  resendApiKey: "re_test",
  contactFromEmail: "contact@harmonyrooster.com",
  contactToEmail: "clpowe@gmail.com",
  public: {
    siteUrl: "https://harmonyrooster.com",
  },
}));
vi.stubGlobal("readBody", async (event: { body: unknown }) => event.body);
vi.stubGlobal(
  "getHeader",
  (event: { headers?: Record<string, string> }, name: string) => event.headers?.[name],
);
vi.stubGlobal("getRequestIP", (event: { ip?: string }) => event.ip);
vi.stubGlobal("useStorage", () => ({
  getItem: vi.fn(async (key: string) => storageState.get(key)),
  setItem: vi.fn(async (key: string, value: unknown) => {
    storageState.set(key, value);
  }),
}));
vi.stubGlobal(
  "createError",
  (input: { message: string; statusCode: number; statusMessage?: string }) => {
    const error = new Error(input.message) as Error & {
      statusCode?: number;
      statusMessage?: string;
    };

    error.statusCode = input.statusCode;
    error.statusMessage = input.statusMessage;

    return error;
  },
);

describe("handleContactSubmission", () => {
  beforeEach(() => {
    sendEmail.mockReset();
    storageState.clear();
    vi.restoreAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(10_000);
  });

  it("sends an email for a valid submission", async () => {
    sendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const event = {
      body: {
        name: "Chris Powe",
        email: "CLPOWE@GMAIL.COM",
        message: "I would like to learn more about your services.",
        company: "",
        startedAt: 8_000,
      },
      headers: {
        origin: "https://harmonyrooster.com",
      },
      ip: "127.0.0.1",
    };

    const { handleContactSubmission } = await import("./contact.post");
    const result = await handleContactSubmission(event);

    expect(result).toEqual({ ok: true });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "contact@harmonyrooster.com",
        replyTo: "clpowe@gmail.com",
        subject: "New contact form submission from Chris Powe",
        to: ["clpowe@gmail.com"],
      }),
    );
  });

  it("rejects submissions from an unexpected origin", async () => {
    const event = {
      body: {
        name: "Chris Powe",
        email: "clpowe@gmail.com",
        message: "This message is long enough to pass validation.",
        company: "",
        startedAt: 8_000,
      },
      headers: {
        origin: "https://evil.example.com",
      },
      ip: "127.0.0.1",
    };

    const { handleContactSubmission } = await import("./contact.post");

    await expect(handleContactSubmission(event)).rejects.toMatchObject({
      message: "Invalid request origin",
      statusCode: 403,
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not send email for honeypot submissions", async () => {
    const event = {
      body: {
        name: "Chris Powe",
        email: "clpowe@gmail.com",
        message: "This message is long enough to pass validation.",
        company: "bot-filled",
        startedAt: 8_000,
      },
      headers: {
        origin: "https://harmonyrooster.com",
      },
      ip: "127.0.0.1",
    };

    const { handleContactSubmission } = await import("./contact.post");
    const result = await handleContactSubmission(event);

    expect(result).toEqual({ ok: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
