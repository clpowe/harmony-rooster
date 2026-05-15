import { Resend } from "resend";
import {
  CONTACT_MIN_SUBMIT_TIME_MS,
  CONTACT_RATE_LIMIT_MAX_ATTEMPTS,
  CONTACT_RATE_LIMIT_WINDOW_MS,
  contactFormSchema,
  type ContactFormValues,
} from "../../shared/types/contact";

type H3Event = any;

type ContactRateLimitRecord = {
  attempts: number[];
};

function getAllowedOrigin(siteUrl: string | undefined): string | null {
  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

async function enforceRateLimit(ipAddress: string) {
  const storage = useStorage("cache");
  const now = Date.now();
  const key = `contact-rate-limit:${ipAddress}`;
  const record = (await storage.getItem<ContactRateLimitRecord>(key)) ?? { attempts: [] };
  const recentAttempts = record.attempts.filter(
    (attempt) => now - attempt < CONTACT_RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= CONTACT_RATE_LIMIT_MAX_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message: "Please wait before sending another message.",
    });
  }

  recentAttempts.push(now);
  await storage.setItem(key, { attempts: recentAttempts });
}

function assertRequestOrigin(event: H3Event) {
  const allowedOrigin = getAllowedOrigin(useRuntimeConfig(event).public.siteUrl);
  const origin = getHeader(event, "origin");

  if (allowedOrigin && origin && origin !== allowedOrigin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Invalid request origin",
    });
  }
}

function assertSubmissionTiming(values: ContactFormValues) {
  if (Date.now() - values.startedAt < CONTACT_MIN_SUBMIT_TIME_MS) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Submission rejected",
    });
  }
}

function buildPlainTextMessage(values: ContactFormValues) {
  return [
    "New contact form submission",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    "",
    "Message:",
    values.message,
  ].join("\n");
}

export async function handleContactSubmission(event: H3Event) {
  const config = useRuntimeConfig(event);

  if (!config.resendApiKey || !config.contactFromEmail || !config.contactToEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Misconfiguration",
      message: "Contact form email delivery is not configured",
    });
  }

  assertRequestOrigin(event);

  const body = await readBody(event);
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parsed.error.issues[0]?.message ?? "Invalid form submission",
    });
  }

  const values = parsed.data;

  if (values.company) {
    return { ok: true };
  }

  assertSubmissionTiming(values);

  const ipAddress = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  await enforceRateLimit(ipAddress);

  const resend = new Resend(config.resendApiKey);
  const response = await resend.emails.send({
    from: config.contactFromEmail,
    to: [config.contactToEmail, "harmonyrooster@gmail.com"],
    replyTo: values.email,
    subject: `New contact form submission from ${values.name}`,
    text: buildPlainTextMessage(values),
  });

  if (response.error) {
    throw createError({
      statusCode: 502,
      statusMessage: "Email Delivery Failed",
      message: "We could not send your message right now.",
    });
  }

  return {
    ok: true,
  };
}

export default defineEventHandler(handleContactSubmission);
