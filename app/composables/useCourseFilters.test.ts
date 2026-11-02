import { describe, expect, it } from "vite-plus/test";
import { nextTick, ref } from "vue";
import type { Course } from "../../shared/types/courses";
import { useCourseFilters } from "./useCourseFilters";

function makeCourse(id: string, date: string): Course {
  return {
    id,
    course_name: `Course ${id}`,
    description: "Training",
    cost: 95,
    duration: 6,
    sessions: [
      {
        id: `session-${id}`,
        session_name: "Morning",
        date,
        time: "9:00 AM",
        location: "Training center",
        capacity: 12,
        spots_available: 4,
      },
    ],
  };
}

describe("useCourseFilters", () => {
  it("updates filter options and counts when asynchronous data arrives", async () => {
    const data = ref<Course[] | null>(null);
    const filters = useCourseFilters(data);
    expect(filters.filteredCourses.value).toEqual([]);
    expect(filters.monthOptions.value).toEqual([{ value: "", label: "All dates" }]);

    data.value = [makeCourse("one", "2026-10-16"), makeCourse("two", "2027-10-16")];
    await nextTick();

    expect(filters.sessionCount.value).toBe(2);
    expect(filters.courseOptions.value.map(({ value }) => value)).toEqual(["", "one", "two"]);
    expect(filters.monthOptions.value.map(({ value }) => value)).toEqual([
      "",
      "2026-10",
      "2027-10",
    ]);
  });

  it("reacts to both selections, exposes an empty result, and resets to all sessions", () => {
    const data = ref([makeCourse("one", "2026-10-16"), makeCourse("two", "2026-11-13")]);
    const filters = useCourseFilters(data);
    filters.selectedCourse.value = "one";
    filters.selectedMonth.value = "2026-11";

    expect(filters.filteredCourses.value).toEqual([]);
    expect(filters.sessionCount.value).toBe(0);
    expect(filters.hasFilters.value).toBe(true);

    filters.resetFilters();

    expect(filters.sessionCount.value).toBe(2);
    expect(filters.hasFilters.value).toBe(false);
  });

  it("clears selections removed by a refresh rather than leaving hidden active filters", async () => {
    const data = ref([makeCourse("one", "2026-10-16")]);
    const filters = useCourseFilters(data);
    filters.selectedCourse.value = "one";
    filters.selectedMonth.value = "2026-10";

    data.value = [makeCourse("two", "2026-11-13")];
    await nextTick();

    expect(filters.selectedCourse.value).toBe("");
    expect(filters.selectedMonth.value).toBe("");
    expect(filters.filteredCourses.value[0]?.id).toBe("two");
  });

  it("reacts to session dates changing within a retained course", async () => {
    const data = ref([makeCourse("one", "2026-10-16")]);
    const filters = useCourseFilters(data);
    filters.selectedCourse.value = "one";
    filters.selectedMonth.value = "2026-10";

    data.value[0]!.sessions![0]!.date = "2026-11-13";
    await nextTick();

    expect(filters.selectedCourse.value).toBe("one");
    expect(filters.selectedMonth.value).toBe("");
    expect(filters.monthOptions.value.map(({ value }) => value)).toEqual(["", "2026-11"]);
    expect(filters.sessionCount.value).toBe(1);
  });
});
