import { createRequestLogger, getRequestId } from "../utils/logger";

type H3Event = any;

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

    createRequestLogger(event, {
      defaults: {
        operation: "request.error",
        source: "nitro",
      },
    }).error(
      "Unhandled API error",
      error instanceof Error
        ? {
            errorMessage: error.message,
            errorName: error.name,
          }
        : {
            errorMessage: "Unknown error",
            errorName: "UnknownError",
          },
    );
  });
});
