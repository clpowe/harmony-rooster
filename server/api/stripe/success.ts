import { loadRegistrationOutcome } from "../../services/registration-outcome";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  setResponseHeader(event, "Referrer-Policy", "no-referrer");
  const sessionId = getQuery(event).session_id;
  const authorization = getHeader(event, "authorization") ?? "";
  if (typeof sessionId !== "string") {
    throw createError({ statusCode: 400, message: "Session ID is required" });
  }
  const token = /^Bearer ([a-f0-9]{64})$/.exec(authorization)?.[1] ?? "";
  return loadRegistrationOutcome(sessionId, token, event);
});
