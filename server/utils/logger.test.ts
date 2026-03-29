import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  createServerLogger,
  normalizeError,
  sanitizeLogContext,
  shouldSendServerLogs,
} from "./logger";

describe("logger utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.POSTHOG_SERVER_LOG_ENABLED;
    delete process.env.NUXT_POSTHOG_PROJECT_API_KEY;
    delete process.env.NUXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NUXT_POSTHOG_LOG_ENDPOINT;
  });

  it("sanitizes nested sensitive fields", () => {
    expect(
      sanitizeLogContext({
        checkoutSessionId: "cs_test_123",
        email: "customer@example.com",
        nested: {
          signature: "whsec_123",
          status: "paid",
        },
      }),
    ).toEqual({
      checkoutSessionId: "cs_test_123",
      email: "[REDACTED]",
      nested: {
        signature: "[REDACTED]",
        status: "paid",
      },
    });
  });

  it("does not send logs when transport is disabled", () => {
    expect(shouldSendServerLogs()).toBe(false);
  });

  it("sends logs when transport is enabled and config is present", async () => {
    process.env.POSTHOG_SERVER_LOG_ENABLED = "true";
    process.env.NUXT_POSTHOG_PROJECT_API_KEY = "phc_test";
    process.env.NUXT_POSTHOG_LOG_ENDPOINT = "https://us.i.posthog.com/i/v1/logs";

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    createServerLogger({
      defaults: {
        source: "test",
      },
    }).info("hello world", {
      severityLabel: "info",
    });

    await Promise.resolve();

    expect(infoSpy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://us.i.posthog.com/i/v1/logs",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer phc_test",
        }),
        method: "POST",
      }),
    );
  });

  it("normalizes errors safely", () => {
    expect(normalizeError(new Error("boom"))).toEqual(
      expect.objectContaining({
        errorMessage: "boom",
        errorName: "Error",
      }),
    );
  });
});
