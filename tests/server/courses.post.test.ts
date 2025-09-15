import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Nitro/ H3 auto-imported globals used in the handler file
declare global {
  // eslint-disable-next-line no-var
  var __airtableTables: any;
}

// Provide global implementations before importing the handler
(globalThis as any).defineEventHandler = (fn: any) => fn;
(globalThis as any).createError = (props: any) => {
  const err: any = new Error(props?.message || "Error");
  Object.assign(err, props);
  return err;
};
(globalThis as any).useRuntimeConfig = (_event: any) => ({
  airtableKey: (globalThis as any).__test_airtable_key ?? "test_key",
});
(globalThis as any).readBody = async (event: any) => event.__body;
(globalThis as any).setResponseStatus = (event: any, status: number) => {
  event.__status = status;
};

// Mock airtable SDK used by the handler
vi.mock("airtable", () => {
  function baseFactory(_baseId: string) {
    return (table: string) => {
      const impl = (globalThis as any).__airtableTables || {};
      return impl[table] || {};
    };
  }
  return {
    default: {
      configure: vi.fn(),
      base: baseFactory,
    },
  };
});

describe("server/api/courses.post.ts", () => {
  beforeEach(() => {
    (globalThis as any).__test_airtable_key = "test_key";
    (globalThis as any).__airtableTables = {
      Sessions: {
        find: vi.fn().mockResolvedValue({
          id: "sess_1",
          get: (_: string) => "",
        }),
      },
      Registrations: {
        create: vi.fn().mockResolvedValue([{ id: "reg_1" }]),
      },
    };
  });

  it("creates a registration and returns 201 with ids", async () => {
    const handler = (await import("../../server/api/courses.post"))
      .default as any;

    const event: any = {
      __body: {
        name: "Alice",
        email: "alice@example.com",
        phonenumber: "(555) 123-4567",
        sessionId: "sess_1",
      },
    };

    const res = await handler(event);

    expect(event.__status).toBe(201);
    expect(res).toMatchObject({
      ok: true,
      registrationId: "reg_1",
      sessionId: "sess_1",
    });

    const tables = (globalThis as any).__airtableTables;
    expect(tables.Sessions.find).toHaveBeenCalledWith("sess_1");
    expect(tables.Registrations.create).toHaveBeenCalled();
  });

  it("normalizes session id casing from client", async () => {
    const handler = (await import("../../server/api/courses.post"))
      .default as any;

    const event: any = {
      __body: {
        name: "Bob",
        email: "bob@example.com",
        phonenumber: "(555) 111-2222",
        session_Id: "sess_x",
      },
    }; // adjust Sessions.find to check for normalized id
    (globalThis as any).__airtableTables.Sessions.find = vi.fn()
      .mockResolvedValue({ id: "sess_x" });

    const res = await handler(event);
    expect(event.__status).toBe(201);
    expect(res.sessionId).toBe("sess_x");
    expect((globalThis as any).__airtableTables.Sessions.find)
      .toHaveBeenCalledWith("sess_x");
  });

  it("returns 400 on validation errors", async () => {
    const handler = (await import("../../server/api/courses.post"))
      .default as any;

    const event: any = {
      __body: {
        // missing name, bad email, missing session id
        email: "not-an-email",
        phonenumber: "123",
      },
    };

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it("returns 404 when session is not found", async () => {
    const handler = (await import("../../server/api/courses.post"))
      .default as any;
    (globalThis as any).__airtableTables.Sessions.find = vi.fn()
      .mockImplementation(() => {
        const err: any = new Error("not found");
        throw err;
      });

    const event: any = {
      __body: {
        name: "Carl",
        email: "carl@example.com",
        phonenumber: "(555) 987-6543",
        sessionId: "missing_1",
      },
    };

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns 500 when airtable key is missing", async () => {
    (globalThis as any).__test_airtable_key = "";
    const handler = (await import("../../server/api/courses.post"))
      .default as any;

    const event: any = {
      __body: {
        name: "Dora",
        email: "dora@example.com",
        phonenumber: "(555) 321-7654",
        sessionId: "sess_1",
      },
    };

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 });
  });
});
