import type { Ref } from "vue";
import { computed } from "vue";
import type { Course, Session } from "../../shared/types/courses";

type SessionWithCourse = Session & {
  course_id: string;
  course_name: string;
  course_description: string;
  course_cost: number;
};

export function useCourses() {
  const { data, pending, error, refresh } = useAsyncData<Course[]>("courses", () =>
    $fetch<Course[]>("/api/courses" as string),
  );

  const getSessionById = (id: string) =>
    computed<SessionWithCourse | undefined>(() => {
      for (const course of data.value ?? []) {
        const found = course.sessions?.find((s) => s.id === id);
        if (found) {
          return {
            ...found,
            course_id: course.id,
            course_name: course.course_name,
            course_description: course.description,
            course_cost: course.cost,
          };
        }
      }
      return undefined;
    });

  return {
    courses: data as Ref<Course[] | null>,
    pending,
    error,
    refreshCourses: refresh,
    getSessionById,
  };
}
