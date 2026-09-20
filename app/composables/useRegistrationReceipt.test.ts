import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { ref } from "vue";
const hooks = vi.hoisted(() => ({
  mount: undefined as (() => void) | undefined,
  unmount: undefined as (() => void) | undefined,
}));
vi.mock("vue", async (original) => ({
  ...(await original<typeof import("vue")>()),
  onMounted: (fn: () => void) => {
    hooks.mount = fn;
  },
  onBeforeUnmount: (fn: () => void) => {
    hooks.unmount = fn;
  },
}));
const data = ref<{ registration: { canRefresh: boolean } } | null>(null);
const error = ref<Error | null>(null);
const pending = ref(false);
const refresh = vi.fn(async () => {
  data.value = { registration: { canRefresh: true } };
});
const clear = vi.fn();
const useFetch = vi.fn((_url: string, _options: unknown) => ({
  data,
  error,
  pending,
  refresh,
  clear,
}));
vi.stubGlobal("useFetch", useFetch);
vi.stubGlobal("useState", () => ref("a".repeat(64)));
const { useRegistrationReceipt } = await import("./useRegistrationReceipt");
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  data.value = null;
  error.value = null;
  pending.value = false;
  refresh.mockImplementation(async () => {
    data.value = { registration: { canRefresh: true } };
  });
});
afterEach(() => {
  hooks.unmount?.();
  vi.useRealTimers();
});
describe("receipt refresh lifecycle", () => {
  it("loads on mount, polls for 30 seconds, then waits for manual refresh", async () => {
    const receipt = useRegistrationReceipt("cs_test_123");
    expect(receipt.initialLoading.value).toBe(true);
    expect(refresh).not.toHaveBeenCalled();
    hooks.mount?.();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(refresh).toHaveBeenCalledTimes(7);
    expect(receipt.autoRefreshFinished.value).toBe(true);
    await receipt.refresh();
    expect(receipt.autoRefreshFinished.value).toBe(false);
    expect(refresh).toHaveBeenCalledTimes(8);
  });
  it("stops polling after confirmation", async () => {
    useRegistrationReceipt("cs_test_123");
    hooks.mount?.();
    await vi.advanceTimersByTimeAsync(1);
    refresh.mockImplementation(async () => {
      data.value = { registration: { canRefresh: false } };
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
  it("stops on lookup errors and allows an explicit retry", async () => {
    refresh.mockImplementation(async () => {
      error.value = new Error("Lookup failed");
    });
    const receipt = useRegistrationReceipt("cs_test_123");
    hooks.mount?.();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(refresh).toHaveBeenCalledTimes(1);
    error.value = null;
    refresh.mockImplementation(async () => {
      data.value = { registration: { canRefresh: false } };
    });
    await receipt.refresh();
    expect(refresh).toHaveBeenCalledTimes(2);
  });
  it("does not keep polling after navigating away", async () => {
    useRegistrationReceipt("cs_test_123");
    hooks.mount?.();
    await vi.advanceTimersByTimeAsync(1);
    hooks.unmount?.();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalled();
  });
  it("sends access in a header instead of the request URL", () => {
    useRegistrationReceipt("cs_test_123");
    const options = useFetch.mock.calls[0]?.[1] as unknown as {
      query: object;
      headers: { value: object };
    };
    expect(options.query).toEqual({ session_id: "cs_test_123" });
    expect(options.headers.value).toEqual({ Authorization: `Bearer ${"a".repeat(64)}` });
  });
});
