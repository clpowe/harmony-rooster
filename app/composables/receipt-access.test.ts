import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { ref, type Ref } from "vue";
vi.stubGlobal("defineNuxtPlugin", (plugin: unknown) => plugin);
const state = new Map<string, Ref<string | null>>();
vi.stubGlobal("useState", (key: string) => {
  if (!state.has(key)) state.set(key, ref(null));
  return state.get(key);
});
const plugin = (await import("../plugins/receipt-access.client")).default as unknown as {
  order: number;
  setup: () => void;
};
let storage: Map<string, string>;
let replace: ReturnType<typeof vi.fn>;
const token = "a".repeat(64);
beforeEach(() => {
  state.clear();
  storage = new Map();
  replace = vi.fn();
  vi.stubGlobal("window", {
    location: { href: `https://example.com/success?session_id=cs_123#receipt_token=${token}` },
    history: { state: { marker: "router" }, replaceState: replace },
    sessionStorage: {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.get(key) ?? null,
    },
  });
});
describe("receipt access bootstrap", () => {
  it("removes the credential before router/analytics startup and retains same-tab access", () => {
    plugin.setup();
    expect(plugin.order).toBeLessThan(-20);
    expect(replace).toHaveBeenCalledWith(
      { marker: "router" },
      "",
      "https://example.com/success?session_id=cs_123",
    );
    expect(state.get("receipt-access:cs_123")?.value).toBe(token);
    expect(storage.get("receipt-access:cs_123")).toBe(token);
    state.clear();
    window.location.href = "https://example.com/success?session_id=cs_123";
    plugin.setup();
    expect(state.get("receipt-access:cs_123")?.value).toBe(token);
  });
  it("still removes the fragment and retains access when storage is blocked", () => {
    window.sessionStorage.setItem = () => {
      expect(replace).toHaveBeenCalled();
      throw new Error("Blocked");
    };
    plugin.setup();
    expect(state.get("receipt-access:cs_123")?.value).toBe(token);
  });
  it("does not share stored credentials between Checkout IDs", () => {
    storage.set("receipt-access:cs_other", token);
    window.location.href = "https://example.com/success?session_id=cs_123";
    plugin.setup();
    expect(state.get("receipt-access:cs_123")?.value).toBeNull();
  });
});
