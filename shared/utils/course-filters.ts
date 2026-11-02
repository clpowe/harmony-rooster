import type { Course } from "../types/courses";

export type CourseFilterOption = {
  value: string;
  label: string;
};

export type CourseFilters = {
  courseId?: string;
  month?: string;
};

/** Sessions carry a calendar date, even when Airtable serializes one as an ISO timestamp. */
export function getSessionMonth(date: string): string | null {
  const calendarDate = date.trim().match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
  if (!calendarDate) return null;

  const parsed = new Date(`${calendarDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== calendarDate) {
    return null;
  }

  return calendarDate.slice(0, 7);
}

export function getCourseFilterOptions(courses: readonly Course[]): CourseFilterOption[] {
  return Array.from(
    new Map(
      courses.map((course) => [course.id, { value: course.id, label: course.course_name }]),
    ).values(),
  );
}

export function getCourseMonthOptions(courses: readonly Course[]): CourseFilterOption[] {
  const months = new Set<string>();
  for (const course of courses) {
    for (const session of course.sessions ?? []) {
      const month = getSessionMonth(session.date);
      if (month) months.add(month);
    }
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return Array.from(months)
    .sort()
    .map((month) => ({
      value: month,
      label: formatter.format(new Date(`${month}-01T12:00:00.000Z`)),
    }));
}

export function filterCourses(courses: readonly Course[], filters: CourseFilters): Course[] {
  return courses.flatMap((course) => {
    if (filters.courseId && course.id !== filters.courseId) return [];
    if (!filters.month) return [course];

    const sessions = course.sessions?.filter(
      (session) => getSessionMonth(session.date) === filters.month,
    );
    return sessions?.length ? [{ ...course, sessions }] : [];
  });
}
