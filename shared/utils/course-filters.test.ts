import { describe, expect, it } from "vite-plus/test";
import type { Course, Session } from "../types/courses";
import {
  filterCourses,
  getCourseFilterOptions,
  getCourseMonthOptions,
  getSessionMonth,
} from "./course-filters";

function session(id: string, date: string): Session {
  return {
    id,
    date,
    session_name: id,
    time: "9:00 AM",
    location: "Training center",
    capacity: 12,
    spots_available: 4,
  };
}

const courses: Course[] = [
  {
    id: "medication",
    course_name: "Medication Administration",
    description: "Medication training",
    cost: 95,
    duration: 6,
    sessions: [
      session("october", "2026-10-16"),
      session("november", "2026-11-01T00:30:00.000Z"),
      session("next-october", "2027-10-16"),
    ],
  },
  {
    id: "support",
    course_name: "Personal Support",
    description: "Support training",
    cost: 60,
    duration: 3,
    sessions: [session("second-october", "2026-10-23"), session("invalid", "2026-02-31")],
  },
  {
    id: "unavailable",
    course_name: "Caregiver Workshop",
    description: "Upcoming workshop",
    cost: 75,
    duration: 4,
  },
];

describe("course filters", () => {
  it.each([
    ["2026-11-01T00:30:00.000Z", "2026-11"],
    ["2026-12-31T23:30:00-08:00", "2026-12"],
    ["2028-02-29", "2028-02"],
    [" 2026-10-16 ", "2026-10"],
  ])("uses the calendar month of %s without shifting timezones", (date, month) => {
    expect(getSessionMonth(date)).toBe(month);
  });

  it.each(["", "October 16, 2026", "2026-13-01", "2026-02-29", "2026-02-31", "2026-10"])(
    "excludes invalid calendar date %j from month options",
    (date) => expect(getSessionMonth(date)).toBeNull(),
  );

  it("builds course options from actual course identities, including temporarily unavailable courses", () => {
    expect(getCourseFilterOptions(courses)).toEqual([
      { value: "medication", label: "Medication Administration" },
      { value: "support", label: "Personal Support" },
      { value: "unavailable", label: "Caregiver Workshop" },
    ]);
  });

  it("deduplicates months, sorts chronologically, and keeps different years separate", () => {
    expect(getCourseMonthOptions(courses)).toEqual([
      { value: "2026-10", label: "Oct 2026" },
      { value: "2026-11", label: "Nov 2026" },
      { value: "2027-10", label: "Oct 2027" },
    ]);
  });

  it("preserves all courses and their empty states when no filters are selected", () => {
    expect(filterCourses(courses, {})).toEqual(courses);
    expect(getCourseMonthOptions([])).toEqual([]);
  });

  it("combines course and month selections without modifying the loaded data", () => {
    const before = structuredClone(courses);
    const result = filterCourses(courses, { courseId: "medication", month: "2027-10" });
    expect(result).toHaveLength(1);
    expect(result[0]?.sessions?.map(({ id }) => id)).toEqual(["next-october"]);
    expect(courses).toEqual(before);
  });

  it("retains matches across courses and removes empty groups only when filtering dates", () => {
    const result = filterCourses(courses, { month: "2026-10" });
    expect(result.map(({ id }) => id)).toEqual(["medication", "support"]);
    expect(result.flatMap(({ sessions }) => sessions ?? []).map(({ id }) => id)).toEqual([
      "october",
      "second-october",
    ]);
    expect(filterCourses(courses, { courseId: "unavailable" })).toEqual([courses[2]]);
  });

  it("returns no matches for an unavailable course/month combination", () => {
    expect(filterCourses(courses, { courseId: "support", month: "2026-11" })).toEqual([]);
    expect(filterCourses(courses, { courseId: "unknown" })).toEqual([]);
  });
});
