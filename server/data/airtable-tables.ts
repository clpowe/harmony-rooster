import type { Table } from "airtable-ts";
import { AIRTABLE_BASE_ID, AIRTABLE_TABLE_IDS } from "../../shared/constants/airtable";
import type { CourseSessionRecord } from "../../shared/types/courses";

type SessionDetailsRecord = {
  id: string;
  sessionName: string;
  date: string;
  time: string;
  location: string;
};

export type CheckoutSessionRecord = SessionDetailsRecord & {
  cost: number[];
  productID: string[];
};

export type AirtableSessionRecord = CourseSessionRecord & {
  registrations: string[];
};

export type AirtableCustomerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  stripeID: string | null;
};

const sessionTable = {
  name: "session",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.SESSIONS,
};

const sessionDetailsFields = {
  schema: {
    sessionName: "string",
    date: "string",
    time: "string",
    location: "string",
  },
  mappings: {
    sessionName: "session-name",
    date: "date",
    time: "time",
    location: "location",
  },
} as const;

const sessionAvailabilityFields = {
  schema: {
    capacity: "number",
    spotsAvailable: "number",
  },
  mappings: {
    capacity: "capacity",
    spotsAvailable: "spots-available",
  },
} as const;

export const sessionDetailsTable: Table<SessionDetailsRecord> = {
  ...sessionTable,
  schema: {
    ...sessionDetailsFields.schema,
  },
  mappings: {
    ...sessionDetailsFields.mappings,
  },
};

export const checkoutSessionsTable: Table<CheckoutSessionRecord> = {
  ...sessionTable,
  schema: {
    ...sessionDetailsFields.schema,
    cost: "number[]",
    productID: "string[]",
  },
  mappings: {
    ...sessionDetailsFields.mappings,
    cost: "cost",
    productID: "productID",
  },
};

export const courseSessionsTable: Table<CourseSessionRecord> = {
  ...sessionTable,
  schema: {
    ...sessionDetailsFields.schema,
    ...sessionAvailabilityFields.schema,
  },
  mappings: {
    ...sessionDetailsFields.mappings,
    ...sessionAvailabilityFields.mappings,
  },
};

export const fulfillmentSessionsTable: Table<AirtableSessionRecord> = {
  ...sessionTable,
  schema: {
    ...sessionDetailsFields.schema,
    ...sessionAvailabilityFields.schema,
    registrations: "string[]",
  },
  mappings: {
    ...sessionDetailsFields.mappings,
    ...sessionAvailabilityFields.mappings,
    registrations: "Registrations",
  },
};

export const customersTable: Table<AirtableCustomerRecord> = {
  name: "customer",
  baseId: AIRTABLE_BASE_ID,
  tableId: AIRTABLE_TABLE_IDS.CUSTOMERS,
  schema: {
    first_name: "string",
    last_name: "string",
    email: "string",
    phone: "string",
    stripeID: "string | null",
  },
  mappings: {
    first_name: "first_name",
    last_name: "last_name",
    email: "email",
    phone: "phone",
    stripeID: "stripeID",
  },
};
