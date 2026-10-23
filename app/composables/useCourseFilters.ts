import { computed, ref, watch, type Ref } from "vue";
import type { Course } from "../../shared/types/courses";
import {
  filterCourses,
  getCourseFilterOptions,
  getCourseMonthOptions,
} from "@utils/course-filters";

export function useCourseFilters(courses: Readonly<Ref<readonly Course[] | null | undefined>>) {
  const selectedCourse = ref("");
  const selectedMonth = ref("");
  const courseOptions = computed(() => [
    { value: "", label: "All courses" },
    ...getCourseFilterOptions(courses.value ?? []),
  ]);
  const monthOptions = computed(() => [
    { value: "", label: "All dates" },
    ...getCourseMonthOptions(courses.value ?? []),
  ]);
  const filteredCourses = computed(() =>
    filterCourses(courses.value ?? [], {
      courseId: selectedCourse.value,
      month: selectedMonth.value,
    }),
  );
  const sessionCount = computed(() =>
    filteredCourses.value.reduce((total, course) => total + (course.sessions?.length ?? 0), 0),
  );
  const hasFilters = computed(() => Boolean(selectedCourse.value || selectedMonth.value));

  // A refresh may remove a course or month. Keep the visible selection valid.
  watch([courseOptions, monthOptions], ([nextCourses, nextMonths]) => {
    if (courses.value == null) return;
    if (!nextCourses.some((option) => option.value === selectedCourse.value))
      selectedCourse.value = "";
    if (!nextMonths.some((option) => option.value === selectedMonth.value))
      selectedMonth.value = "";
  });

  function resetFilters() {
    selectedCourse.value = "";
    selectedMonth.value = "";
  }

  return {
    selectedCourse,
    selectedMonth,
    courseOptions,
    monthOptions,
    filteredCourses,
    sessionCount,
    hasFilters,
    resetFilters,
  };
}
