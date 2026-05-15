import { z } from "zod";

const MIN_MESSAGE_LENGTH = 10;
const MIN_NAME_LENGTH = 2;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return normalizeString(value).toLowerCase();
}

function normalizeTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
}

export const CONTACT_MESSAGE_MAX_LENGTH = 250;
export const CONTACT_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const CONTACT_MIN_SUBMIT_TIME_MS = 1_500;

export const contactFormSchema = z.object({
  name: z
    .preprocess(normalizeString, z.string())
    .pipe(
      z
        .string()
        .min(MIN_NAME_LENGTH, "Please enter your name")
        .max(80, "Name must be 80 characters or fewer"),
    ),
  email: z
    .preprocess(normalizeEmail, z.string())
    .pipe(
      z
        .string()
        .email("Please enter a valid email address")
        .max(254, "Email must be 254 characters or fewer"),
    ),
  message: z
    .preprocess(normalizeString, z.string())
    .pipe(
      z
        .string()
        .min(MIN_MESSAGE_LENGTH, "Please enter at least 10 characters")
        .max(
          CONTACT_MESSAGE_MAX_LENGTH,
          `Message must be ${CONTACT_MESSAGE_MAX_LENGTH} characters or fewer`,
        ),
    ),
  company: z
    .preprocess(normalizeString, z.string())
    .pipe(z.string().max(120, "Invalid form submission"))
    .default(""),
  startedAt: z.preprocess(
    normalizeTimestamp,
    z.number().finite("Missing form timestamp").nonnegative("Missing form timestamp"),
  ),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.output<typeof contactFormSchema>;
