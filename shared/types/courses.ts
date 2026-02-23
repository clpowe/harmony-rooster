export type Session = {
  id: string;
  session_name: string;
  date: string;
  time: string;
  capacity: number;
  spots_available: number;
  location: string;
};

export type Course = {
  id: string;
  course_name: string;
  description: string;
  duration: number;
  cost: number;
  sessions?: Session[];
};

export type CourseRecord = {
  id: string;
  sessions: string[];
  courseName: string;
  description: string;
  duration: number;
  cost: number;
};

export type CourseSessionRecord = {
  id: string;
  sessionName: string;
  date: string;
  time: string;
  capacity: number;
  spotsAvailable: number;
  location: string;
};
