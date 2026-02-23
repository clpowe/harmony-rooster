import { AirtableTs, type Table } from "airtable-ts";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "@constants/airtable";

const coursesTable: Table<CourseRecord> = {
  name: "course",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.COURSES,
  schema: {
    sessions: "string[]",
    courseName: "string",
    description: "string",
    duration: "number",
    cost: "number",
  },
  mappings: {
    sessions: "sessions",
    courseName: "course-name",
    description: "description",
    duration: "duration",
    cost: "cost",
  },
};

const sessionsTable: Table<CourseSessionRecord> = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
  schema: {
    sessionName: "string",
    date: "string",
    time: "string",
    capacity: "number",
    spotsAvailable: "number",
    location: "string",
  },
  mappings: {
    sessionName: "session-name",
    date: "date",
    time: "time",
    capacity: "capacity",
    spotsAvailable: "spots-available",
    location: "location",
  },
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!config.airtableKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Missing Airtable API key",
    });
  }

  const db = new AirtableTs({ apiKey: config.airtableKey });

  const records = await db.scan(coursesTable, {
    maxRecords: 4,
    view: "Grid view",
  });

  const today = new Date();

  const allSessionIds = Array.from(
    new Set(records.flatMap((r) => r.sessions ?? [])),
  );

  const sessionMap = new Map<string, CourseSessionRecord & { id: string }>();

  if (allSessionIds.length > 0) {
    const formula = `OR(${allSessionIds
      .map((id) => `RECORD_ID()='${id}'`)
      .join(",")})`;

    const sessionRecords = await db.scan(sessionsTable, {
      filterByFormula: formula,
    });

    sessionRecords.forEach((s) => sessionMap.set(s.id, s));
  }

  const courses = records.map((record): Course => {
    const sessions: Session[] = (record.sessions ?? [])
      .map((id) => sessionMap.get(id))
      .filter((s): s is CourseSessionRecord & { id: string } => !!s)
      .filter((session) => new Date(session.date) >= today)
      .map((session) => ({
        id: session.id,
        session_name: session.sessionName,
        date: session.date,
        time: session.time,
        capacity: session.capacity,
        spots_available: session.spotsAvailable,
        location: session.location,
      }));

    return {
      id: record.id,
      course_name: record.courseName,
      description: record.description,
      duration: record.duration,
      cost: record.cost,
      sessions,
    };
  });

  return courses;
});
