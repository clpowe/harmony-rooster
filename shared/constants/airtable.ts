// Nuxt replaces import.meta.dev at build time, keeping production on its existing base.
export const AIRTABLE_BASE_ID = import.meta.dev ? "appfunxpZDINDA3tq" : "apptCFjP3Ns4FdGGi";

export const AIRTABLE_TABLE_IDS = {
  COURSES: "tblVAjlGsYRj1yFKI",
  SESSIONS: "tbl1Ro2mdLntedaBm",
  CUSTOMERS: "tblVFpaItkvbCGS5x",
  REGISTRATIONS: "tbltA95wT9qJKfsz6",
} as const;
