// Core Airtable generic
export interface AirtableRecord<TFields> {
  id: string;
  createdTime: string; // ISO
  fields: TFields;
}

// Exact fields from your sample
export type SessionFields = {
  "session-name": string;
  Courses: string[]; // linked record IDs
  "course-name (from Courses)": string[]; // lookup
  date: string; // 'YYYY-MM-DD'
  time: string; // e.g. '1:00 PM - 3:00 PM'
  capacity: number;
  Registrations: string[]; // linked record IDs
  "spots-filled": number;
  "spots-available": number;
  cost: number[]; // Airtable number/rollup array
  location: string;
};

export type SessionRecord = AirtableRecord<SessionFields>;
