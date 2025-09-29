import type { Ref } from "vue";
import { computed } from "vue";

type Session = {
  id: string;
  session_name: string;
  date: string;
  time: string;
  capacity: number;
  spots_available: number;
  location: string;
};

type Course = {
  id: string;
  course_name: string;
  description: string;
  duration: number;
  cost: number;
  sessions?: Session[];
};

type SessionWithCourse = Session & {
  course_id: string;
  course_name: string;
  course_description: string;
  course_cost: number;
};

export function useCourses() {
  const { data, pending, error, refresh } = useAsyncData<Course[]>(
    "courses",
    () => $fetch("/api/courses"),
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
