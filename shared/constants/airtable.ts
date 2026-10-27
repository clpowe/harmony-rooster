// Local dev (import.meta.dev, replaced at build time) and Vercel preview deployments
// (VERCEL_ENV, set at runtime) use the Development base; production keeps its existing base.
const useDevelopmentBase = import.meta.dev || process.env.VERCEL_ENV === "preview";

export const AIRTABLE_BASE_ID = useDevelopmentBase ? "appfunxpZDINDA3tq" : "apptCFjP3Ns4FdGGi";

export const AIRTABLE_TABLE_IDS = {
  COURSES: "tblVAjlGsYRj1yFKI",
  SESSIONS: "tbl1Ro2mdLntedaBm",
  CUSTOMERS: "tblVFpaItkvbCGS5x",
  REGISTRATIONS: "tbltA95wT9qJKfsz6",
} as const;
