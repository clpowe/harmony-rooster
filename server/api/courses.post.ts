import AIRTABLE from "airtable";
import * as z from "zod";

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
  token: z.string().min(1, "Token is required"),
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

    const { name, email, phonenumber, sessionId, token } = parsed.data;

    AIRTABLE.configure({ apiKey: config.airtableKey });
    const base = AIRTABLE.base("apptCFjP3Ns4FdGGi");

    // Verify session exists

    const [sessionError, sessionRecord] = await catchError<SessionRecord>(
      base("Sessions").find(sessionId),
    );
    if (sessionError) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Session not found",
      });
    }

    console.log(sessionRecord);

    const [authorizationError, authorization] = await catchError(
      $fetch(config.chargeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.qbAccessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Request-Id": crypto.randomUUID(),
          "Accept-Encoding": "identity",
        },
        body: {
          amount: String(sessionRecord.fields.cost[0]),
          currency: "USD",
          token: token,
          capture: true,
          context: { mobile: false, isEcommerce: true },
        },
      }),
    );
    if (authorizationError) {
      console.log(authorizationError);
      throw createError({
        statusCode: 402,
        statusMessage: "Payment Failed",
        message: authorizationError.message,
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

    const [salesReceiptError, salesReceipt] = await catchError(
      $fetch(
        `https://sandbox-quickbooks.api.intuit.com/v3/company/9341455226679859/salesreceipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.qbAccessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: {
            Line: [
              {
                Description: "Pest Control Services",
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                  TaxCodeRef: {
                    value: "NON",
                  },
                  Qty: 1,
                  UnitPrice: 35,
                  ItemRef: {
                    name: "Pest Control",
                    value: "10",
                  },
                },
                LineNum: 1,
                Amount: 35.0,
              },
            ],
          },
        },
      ),
    );

    if (salesReceiptError) {
      console.log(salesReceiptError);
      throw createError({
        statusCode: 402,
        statusMessage: "Payment Failed",
        message: salesReceiptError.message,
      });
    }
    console.log(salesReceipt);

    setResponseStatus(event, 201);
    return {
      ok: true,
      registrationId: created.id,
      sessionId,
    };
  } catch (error: any) {
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
