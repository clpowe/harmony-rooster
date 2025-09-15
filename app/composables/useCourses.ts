import type { Ref } from "vue";

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

export function useCourses() {
  const { data, pending, error, refresh } = useAsyncData<Course[]>(
    "courses",
    () => $fetch("/api/courses"),
  );

  return {
    courses: data as Ref<Course[] | null>,
    pending,
    error,
    refreshCourses: refresh,
  };
}
