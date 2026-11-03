import { createRequestLogger, getRequestId } from "../utils/logger";

import type { H3Event } from "h3";

function resolveRequestId(event: H3Event): string {
  return getHeader(event, "x-request-id") ?? crypto.randomUUID();
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    event.context.requestId = getRequestId(event) ?? resolveRequestId(event);
  });

  nitroApp.hooks.hook("error", (error, { event }) => {
    if (!event) {
      return;
    }

    const reportedStatus = "statusCode" in error ? error.statusCode : undefined;
    const statusCode =
      typeof reportedStatus === "number" && reportedStatus >= 400 && reportedStatus <= 599
        ? reportedStatus
        : 500;
    const pathname = (event.path ?? "").split("?")[0] ?? "";
    const isApiRequest = pathname === "/api" || pathname.startsWith("/api/");

    // Missing pages (including crawler probes) are expected HTTP responses.
    if (statusCode === 404 && !isApiRequest) return;

    const logger = createRequestLogger(event, {
      defaults: {
        operation: "request.error",
        source: "nitro",
      },
    });
    const context = {
      statusCode,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : "UnknownError",
    };

    if (statusCode < 500) {
      logger.warn("Client request rejected", context);
    } else {
      logger.error(
        process.env.NODE_ENV === "prerender" ? "Prerender request failed" : "Server request failed",
        context,
      );
    }
  });
});
