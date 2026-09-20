import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
const loadOutcome = vi.hoisted(() => vi.fn());
vi.mock("../../services/registration-outcome", () => ({ loadRegistrationOutcome: loadOutcome }));
vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("getQuery", (event: { query?: object }) => event.query ?? {});
vi.stubGlobal("getHeader", (event: { authorization?: string }) => event.authorization);
const setResponseHeader = vi.fn();
vi.stubGlobal("setResponseHeader", setResponseHeader);
vi.stubGlobal("createError", (details: object) => Object.assign(new Error(), details));
const handler = (await import("./success")).default as unknown as (
  event: object,
) => Promise<unknown>;
beforeEach(() => {
  vi.clearAllMocks();
  loadOutcome.mockResolvedValue({ registration: { state: "confirmed" } });
});
describe("success transport", () => {
  it("passes the credential to the outcome module and disables caching", async () => {
    const token = "a".repeat(64);
    const event = { query: { session_id: "cs_test_123" }, authorization: `Bearer ${token}` };
    expect(await handler(event)).toEqual({ registration: { state: "confirmed" } });
    expect(loadOutcome).toHaveBeenCalledWith("cs_test_123", token, event);
    expect(setResponseHeader).toHaveBeenCalledWith(event, "Cache-Control", "private, no-store");
  });
  it.each([{}, { session_id: ["cs_one", "cs_two"] }])(
    "rejects missing or ambiguous IDs",
    async (query) => {
      await expect(handler({ query })).rejects.toMatchObject({ statusCode: 400 });
      expect(loadOutcome).not.toHaveBeenCalled();
    },
  );
  it("does not accept query-string credentials", async () => {
    const event = { query: { session_id: "cs_test_123", receipt_token: "a".repeat(64) } };
    await handler(event);
    expect(loadOutcome).toHaveBeenCalledWith("cs_test_123", "", event);
  });
});
