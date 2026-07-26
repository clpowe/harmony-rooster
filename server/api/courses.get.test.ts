import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const scan = vi.hoisted(() => vi.fn());
const createAirtableClient = vi.hoisted(() => vi.fn());

vi.mock("@constants/airtable", () => ({
  AIRTABLE_BASE_ID: "app_test",
  AIRTABLE_TABLE_IDS: {
    COURSES: "tbl_courses",
    SESSIONS: "tbl_sessions",
  },
}));

vi.mock("airtable-ts", () => ({
  AirtableTs: class {
    scan = scan;

    constructor(options: unknown) {
      createAirtableClient(options);
    }
  },
}));

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("useRuntimeConfig", (event: { config?: Record<string, unknown> }) => ({
  airtableKey: "airtable_test_key",
  ...event.config,
}));
vi.stubGlobal(
  "createError",
  (input: { message: string; statusCode: number; statusMessage?: string }) =>
    Object.assign(new Error(input.message), input),
);

async function getHandler() {
  return (await import("./courses.get")).default as unknown as (
    event: Record<string, unknown>,
  ) => Promise<Array<Record<string, unknown>>>;
}

describe("GET /api/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads linked sessions once, filters past and missing records, and maps API fields", async () => {
    scan
      .mockResolvedValueOnce([
        {
          cost: 120,
          courseName: "Harmony Course",
          description: "Course description",
          duration: 4,
          id: "course_1",
          sessions: ["sess_future", "sess_past", "sess_missing"],
        },
        {
          cost: 80,
          courseName: "Care Course",
          description: "Second course",
          duration: 2,
          id: "course_2",
          sessions: ["sess_future"],
        },
      ])
      .mockResolvedValueOnce([
        {
          capacity: 12,
          date: "2026-05-02",
          id: "sess_future",
          location: "Nashville",
          sessionName: "Future Session",
          spotsAvailable: 3,
          time: "1:00 PM",
        },
        {
          capacity: 12,
          date: "2026-04-30",
          id: "sess_past",
          location: "Memphis",
          sessionName: "Past Session",
          spotsAvailable: 0,
          time: "9:00 AM",
        },
      ]);
    const handler = await getHandler();

    const result = await handler({});

    expect(createAirtableClient).toHaveBeenCalledWith({ apiKey: "airtable_test_key" });
    expect(scan).toHaveBeenNthCalledWith(1, expect.objectContaining({ tableId: "tbl_courses" }), {
      maxRecords: 4,
      view: "Grid view",
    });
    expect(scan).toHaveBeenNthCalledWith(2, expect.objectContaining({ tableId: "tbl_sessions" }), {
      filterByFormula:
        "OR(RECORD_ID()='sess_future',RECORD_ID()='sess_past',RECORD_ID()='sess_missing')",
    });
    expect(result).toEqual([
      {
        cost: 120,
        course_name: "Harmony Course",
        description: "Course description",
        duration: 4,
        id: "course_1",
        sessions: [
          {
            capacity: 12,
            date: "2026-05-02",
            id: "sess_future",
            location: "Nashville",
            session_name: "Future Session",
            spots_available: 3,
            time: "1:00 PM",
          },
        ],
      },
      {
        cost: 80,
        course_name: "Care Course",
        description: "Second course",
        duration: 2,
        id: "course_2",
        sessions: [
          {
            capacity: 12,
            date: "2026-05-02",
            id: "sess_future",
            location: "Nashville",
            session_name: "Future Session",
            spots_available: 3,
            time: "1:00 PM",
          },
        ],
      },
    ]);
  });

  it("does not query the sessions table when courses have no linked sessions", async () => {
    scan.mockResolvedValueOnce([
      {
        cost: 120,
        courseName: "Harmony Course",
        description: "Course description",
        duration: 4,
        id: "course_1",
      },
    ]);
    const handler = await getHandler();

    const result = await handler({});

    expect(scan).toHaveBeenCalledOnce();
    expect(result).toEqual([
      expect.objectContaining({
        id: "course_1",
        sessions: [],
      }),
    ]);
  });

  it("rejects missing Airtable configuration before creating a client", async () => {
    const handler = await getHandler();

    await expect(handler({ config: { airtableKey: "" } })).rejects.toMatchObject({
      message: "Missing Airtable API key",
      statusCode: 500,
    });
    expect(createAirtableClient).not.toHaveBeenCalled();
    expect(scan).not.toHaveBeenCalled();
  });
});
