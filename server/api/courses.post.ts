import AIRTABLE from "airtable";
import * as z from "zod";

type Session = {
  id: string;
  session_name: string;
  date: string;
  time: string;
  capacity: number;
  spots_available: number;
  location: string;
};

const registrationSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phonenumber: z
    .string({ required_error: "Phone number is required" })
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number",
    ),
  // Accept multiple casings for session id used on the client
  sessionId: z.string().min(1, "Session ID is required"),
});

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event);

    if (!config.airtableKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Server Misconfiguration",
        message: "Missing Airtable API key",
      });
    }

    const raw = await readBody(event);
    // Normalize session id naming from clients (sessionId | session_id | session_Id)
    const normalized = {
      ...raw,
      sessionId: raw?.sessionId || raw?.session_id || raw?.session_Id,
    };

    const parsed = registrationSchema.safeParse(normalized);
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      });
    }

    const { name, email, phonenumber, sessionId } = parsed.data;

    AIRTABLE.configure({ apiKey: config.airtableKey });
    const base = AIRTABLE.base("apptCFjP3Ns4FdGGi");

    // Verify session exists
    let sessionRecord;
    try {
      sessionRecord = await base("Sessions").find(sessionId);
    } catch (err: any) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Session not found",
      });
    }

    // Create registration
    const [created] = await base("Registrations").create([
      {
        fields: {
          Name: name,
          Email: email,
          Phone: phonenumber,
          "Payment Status": "Paid",
          Session: [sessionId],
        },
      },
    ]);

    setResponseStatus(event, 201);
    return {
      ok: true,
      registrationId: created.id,
      sessionId,
    };
  } catch (error: any) {
    // If it's an H3 error, rethrow as-is
    if (error?.statusCode) {
      throw error;
    }
    // Otherwise, wrap unknown errors
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: error?.message || "Unexpected error during registration",
    });
  }
});
