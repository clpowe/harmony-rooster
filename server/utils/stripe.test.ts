import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { H3Event } from "h3";
import Stripe from "stripe";

const event = {} as H3Event;

async function loadHelper(stripeSecretKey: unknown) {
  vi.stubGlobal("useRuntimeConfig", () => ({ stripeSecretKey }));
  return import("./stripe");
}

describe("useServerStripe", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { label: "empty", key: "" },
    { label: "whitespace", key: "  " },
    { label: "undefined", key: undefined },
  ])("fails closed with a 500 when the secret key is $label", async ({ key }) => {
    const { useServerStripe } = await loadHelper(key);

    expect(() => useServerStripe(event)).toThrow(
      expect.objectContaining({ message: "Missing Stripe secret key", statusCode: 500 }),
    );
  });

  it("reuses one client across requests", async () => {
    const { useServerStripe } = await loadHelper("sk_test_123");

    const first = useServerStripe(event);

    expect(useServerStripe(event)).toBe(first);
    expect(first).toBeInstanceOf(Stripe);
  });
});
