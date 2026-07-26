import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const errorLog = vi.hoisted(() => vi.fn());
const createRequestLogger = vi.hoisted(() =>
  vi.fn(() => ({
    error: errorLog,
  })),
);
const getRequestId = vi.hoisted(() => vi.fn());
const randomUUID = vi.hoisted(() => vi.fn(() => "generated-request-id"));

vi.mock("../utils/logger", () => ({
  createRequestLogger,
  getRequestId,
}));

vi.stubGlobal("defineNitroPlugin", (plugin: unknown) => plugin);
vi.stubGlobal(
  "getHeader",
  (event: { headers?: Record<string, string> }, name: string) => event.headers?.[name],
);
vi.stubGlobal("crypto", { randomUUID });

type RequestHook = (event: {
  context: Record<string, unknown>;
  headers?: Record<string, string>;
}) => void;
type ErrorHook = (error: unknown, context: { event?: Record<string, unknown> }) => void;

async function registerHooks() {
  const callbacks = new Map<string, (...args: any[]) => void>();
  const hook = vi.fn((name: string, callback: (...args: any[]) => void) => {
    callbacks.set(name, callback);
  });
  const plugin = (await import("./logging")).default as unknown as (nitroApp: {
    hooks: { hook: typeof hook };
  }) => void;

  plugin({ hooks: { hook } });

  return {
    error: callbacks.get("error") as ErrorHook,
    hook,
    request: callbacks.get("request") as RequestHook,
  };
}

describe("server logging plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestId.mockImplementation(
      (event: { context?: { requestId?: string } }) => event.context?.requestId,
    );
  });

  it("registers request and error hooks", async () => {
    const { hook } = await registerHooks();

    expect(hook).toHaveBeenCalledWith("request", expect.any(Function));
    expect(hook).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("preserves an existing request id", async () => {
    const { request } = await registerHooks();
    const event = { context: { requestId: "existing-request-id" } };

    request(event);

    expect(event.context.requestId).toBe("existing-request-id");
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it("uses an incoming request-id header when context has no id", async () => {
    const { request } = await registerHooks();
    const event = {
      context: {} as { requestId?: string },
      headers: { "x-request-id": "header-request-id" },
    };

    request(event);

    expect(event.context.requestId).toBe("header-request-id");
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it("generates a request id when no existing id or header is present", async () => {
    const { request } = await registerHooks();
    const event = { context: {} as { requestId?: string } };

    request(event);

    expect(event.context.requestId).toBe("generated-request-id");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("logs Error details with request context", async () => {
    const { error } = await registerHooks();
    const event = { context: { requestId: "request_123" } };

    error(new TypeError("boom"), { event });

    expect(createRequestLogger).toHaveBeenCalledWith(event, {
      defaults: {
        operation: "request.error",
        source: "nitro",
      },
    });
    expect(errorLog).toHaveBeenCalledWith("Unhandled API error", {
      errorMessage: "boom",
      errorName: "TypeError",
    });
  });

  it("uses safe placeholders for non-Error failures", async () => {
    const { error } = await registerHooks();

    error({ reason: "unknown" }, { event: { context: {} } });

    expect(errorLog).toHaveBeenCalledWith("Unhandled API error", {
      errorMessage: "Unknown error",
      errorName: "UnknownError",
    });
  });

  it("ignores Nitro errors that are not associated with a request", async () => {
    const { error } = await registerHooks();

    error(new Error("startup failure"), {});

    expect(createRequestLogger).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
  });
});
