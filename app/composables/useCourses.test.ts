import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { ref } from "vue";

const data = ref<Array<Record<string, unknown>> | null>(null);
const pending = ref(false);
const error = ref<Error | null>(null);
const refresh = vi.fn();
const fetchCourses = vi.fn();
let asyncDataLoader: (() => unknown) | undefined;

const useAsyncData = vi.fn((key: string, loader: () => unknown) => {
  asyncDataLoader = loader;
  return {
    data,
    error,
    pending,
    refresh,
  };
});

vi.stubGlobal("useAsyncData", useAsyncData);
vi.stubGlobal("$fetch", fetchCourses);

import { useCourses } from "./useCourses";

const courses = [
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
        id: "sess_1",
        location: "Nashville",
        session_name: "Morning Session",
        spots_available: 3,
        time: "9:00 AM",
      },
    ],
  },
  {
    cost: 80,
    course_name: "Care Course",
    description: "Second course",
    duration: 2,
    id: "course_2",
  },
];

describe("useCourses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asyncDataLoader = undefined;
    data.value = null;
    pending.value = false;
    error.value = null;
  });

  it("loads courses through the expected Nuxt async-data key and endpoint", async () => {
    const response = [{ id: "course_1" }];
    fetchCourses.mockResolvedValue(response);

    useCourses();

    expect(useAsyncData).toHaveBeenCalledWith("courses", expect.any(Function));
    await expect(asyncDataLoader?.()).resolves.toBe(response);
    expect(fetchCourses).toHaveBeenCalledWith("/api/courses");
  });

  it("returns the async-data refs and refresh function unchanged", () => {
    const result = useCourses();

    expect(result.courses).toBe(data);
    expect(result.pending).toBe(pending);
    expect(result.error).toBe(error);
    expect(result.refreshCourses).toBe(refresh);
  });

  it("finds a session and enriches it with its parent course", () => {
    data.value = courses;
    const { getSessionById } = useCourses();

    expect(getSessionById("sess_1").value).toEqual({
      capacity: 12,
      course_cost: 120,
      course_description: "Course description",
      course_id: "course_1",
      course_name: "Harmony Course",
      date: "2026-05-02",
      id: "sess_1",
      location: "Nashville",
      session_name: "Morning Session",
      spots_available: 3,
      time: "9:00 AM",
    });
  });

  it("returns undefined for missing data, missing session arrays, and unknown ids", () => {
    const { getSessionById } = useCourses();
    const selected = getSessionById("sess_missing");

    expect(selected.value).toBeUndefined();
    data.value = courses;
    expect(selected.value).toBeUndefined();
  });

  it("updates an existing computed lookup when async course data changes", () => {
    const { getSessionById } = useCourses();
    const selected = getSessionById("sess_1");
    expect(selected.value).toBeUndefined();

    data.value = courses;

    expect(selected.value?.course_id).toBe("course_1");
  });
});
