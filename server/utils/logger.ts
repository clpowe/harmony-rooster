type H3Event = any;

export type LogSeverity = "debug" | "info" | "warn" | "error";

export type LogContextValue =
  | boolean
  | null
  | number
  | string
  | undefined
  | LogContextValue[]
  | {
      [key: string]: LogContextValue;
    };

export type LogContext = {
  [key: string]: LogContextValue;
};

type RuntimeLogConfig = {
  posthogHost?: string;
  posthogLogEndpoint?: string;
  posthogProjectApiKey?: string;
  posthogServerLogEnabled?: boolean | string;
};

type CreateLoggerOptions = {
  defaults?: LogContext;
  event?: H3Event;
};

type CreateRequestLoggerOptions = {
  defaults?: LogContext;
};

type LogRecord = {
  message: string;
  severity: LogSeverity;
  timestamp: string;
} & LogContext;

const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN = /authorization|cookie|email|password|secret|signature|token/i;
const MAX_STACK_LINES = 12;
const SEVERITY_NUMBER: Record<Uppercase<LogSeverity>, number> = {
  DEBUG: 5,
  INFO: 9,
  WARN: 13,
  ERROR: 17,
};

function normalizeBoolean(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
}

function normalizeRuntimeConfig(event?: H3Event): RuntimeLogConfig {
  const runtimeConfig =
    event && typeof useRuntimeConfig === "function"
      ? (useRuntimeConfig(event) as RuntimeLogConfig)
      : undefined;

  return {
    posthogHost:
      runtimeConfig?.posthogHost ?? process.env.NUXT_POSTHOG_HOST ?? "https://us.i.posthog.com",
    posthogLogEndpoint:
      runtimeConfig?.posthogLogEndpoint ??
      process.env.NUXT_POSTHOG_LOG_ENDPOINT ??
      `${process.env.NUXT_POSTHOG_HOST ?? "https://us.i.posthog.com"}/i/v1/logs`,
    posthogProjectApiKey:
      runtimeConfig?.posthogProjectApiKey ??
      process.env.NUXT_POSTHOG_PROJECT_API_KEY ??
      process.env.NUXT_PUBLIC_POSTHOG_KEY,
    posthogServerLogEnabled:
      runtimeConfig?.posthogServerLogEnabled ??
      process.env.POSTHOG_SERVER_LOG_ENABLED ??
      process.env.NODE_ENV === "production",
  };
}

export function shouldSendServerLogs(event?: H3Event): boolean {
  const config = normalizeRuntimeConfig(event);
  return (
    normalizeBoolean(config.posthogServerLogEnabled) &&
    Boolean(config.posthogProjectApiKey) &&
    Boolean(config.posthogLogEndpoint)
  );
}

function sanitizeString(key: string, value: string): string {
  return SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : value;
}

export function sanitizeLogContext(value: LogContextValue, key = ""): LogContextValue {
  if (value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogContext(item, key));
  }

  if (typeof value === "string") {
    return sanitizeString(key, value);
  }

  if (typeof value !== "object") {
    return value;
  }

  const sanitizedEntries = Object.entries(value).map(([entryKey, entryValue]) => {
    if (SENSITIVE_KEY_PATTERN.test(entryKey)) {
      return [entryKey, REDACTED] as const;
    }

    return [entryKey, sanitizeLogContext(entryValue, entryKey)] as const;
  });

  return Object.fromEntries(sanitizedEntries);
}

export function normalizeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack?.split("\n").slice(0, MAX_STACK_LINES).join("\n"),
    };
  }

  if (typeof error === "string") {
    return {
      errorMessage: error,
      errorName: "Error",
    };
  }

  return {
    errorMessage: "Unknown error",
    errorName: "UnknownError",
    errorValue: sanitizeLogContext(error as LogContextValue, "errorValue"),
  };
}

function serializeAttributeValue(value: LogContextValue): unknown {
  if (value == null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => serializeAttributeValue(entry))
      .filter((entry) => entry !== undefined);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

function recordToOtlpAttributes(record: LogRecord) {
  return Object.entries(record)
    .filter(([key, value]) => key !== "message" && value !== undefined)
    .map(([key, value]) => {
      const serializedValue = serializeAttributeValue(value);

      if (serializedValue === undefined) {
        return null;
      }

      if (typeof serializedValue === "boolean") {
        return {
          key,
          value: {
            boolValue: serializedValue,
          },
        };
      }

      if (typeof serializedValue === "number") {
        return {
          key,
          value: {
            doubleValue: serializedValue,
          },
        };
      }

      if (Array.isArray(serializedValue)) {
        return {
          key,
          value: {
            arrayValue: {
              values: serializedValue.map((entry) => ({
                stringValue: String(entry),
              })),
            },
          },
        };
      }

      return {
        key,
        value: {
          stringValue: JSON.stringify(serializedValue),
        },
      };
    })
    .filter(Boolean);
}

function buildOtlpPayload(record: LogRecord) {
  const severityText = record.severity.toUpperCase() as Uppercase<LogSeverity>;

  return {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: {
                stringValue: "harmony-rooster",
              },
            },
          ],
        },
        scopeLogs: [
          {
            scope: {
              name: "harmony-rooster.server-logger",
            },
            logRecords: [
              {
                timeUnixNano: String(Date.parse(record.timestamp) * 1_000_000),
                severityNumber: SEVERITY_NUMBER[severityText],
                severityText,
                body: {
                  stringValue: record.message,
                },
                attributes: recordToOtlpAttributes(record),
              },
            ],
          },
        ],
      },
    ],
  };
}

async function sendToPostHog(record: LogRecord, event?: H3Event): Promise<void> {
  if (!shouldSendServerLogs(event)) {
    return;
  }

  const config = normalizeRuntimeConfig(event);

  try {
    await fetch(config.posthogLogEndpoint as string, {
      body: JSON.stringify(buildOtlpPayload(record)),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.posthogProjectApiKey}`,
      },
      method: "POST",
    });
  } catch (transportError) {
    const message =
      transportError instanceof Error ? transportError.message : "Unknown PostHog transport error";

    console.warn("PostHog log transport failed", {
      error: message,
    });
  }
}

function writeToConsole(record: LogRecord): void {
  const { message, ...context } = record;

  switch (record.severity) {
    case "debug":
      console.debug(message, context);
      break;
    case "info":
      console.info(message, context);
      break;
    case "warn":
      console.warn(message, context);
      break;
    case "error":
      console.error(message, context);
      break;
  }
}

function getRequestPath(event: H3Event): string | undefined {
  return event?.path ?? event?.node?.req?.url;
}

function getRequestMethod(event: H3Event): string | undefined {
  return event?.node?.req?.method;
}

export function getRequestId(event?: H3Event): string | undefined {
  return event?.context?.requestId;
}

export function getRequestLogContext(event?: H3Event): LogContext {
  return {
    environment: process.env.NODE_ENV ?? "development",
    method: getRequestMethod(event),
    requestId: getRequestId(event),
    route: getRequestPath(event),
  };
}

function buildLogRecord(severity: LogSeverity, message: string, context: LogContext): LogRecord {
  return {
    ...context,
    message,
    severity,
    timestamp: new Date().toISOString(),
  };
}

export function createServerLogger(options: CreateLoggerOptions = {}) {
  const defaults = sanitizeLogContext(options.defaults ?? {}) as LogContext;

  const log = (severity: LogSeverity, message: string, context: LogContext = {}) => {
    const sanitizedContext = sanitizeLogContext(context) as LogContext;
    const record = buildLogRecord(severity, message, {
      ...defaults,
      ...sanitizedContext,
    });

    writeToConsole(record);
    void sendToPostHog(record, options.event);
  };

  return {
    debug: (message: string, context?: LogContext) => log("debug", message, context),
    error: (message: string, context?: LogContext) => log("error", message, context),
    info: (message: string, context?: LogContext) => log("info", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
  };
}

export function createRequestLogger(event: H3Event, options: CreateRequestLoggerOptions = {}) {
  return createServerLogger({
    defaults: {
      ...getRequestLogContext(event),
      ...options.defaults,
    },
    event,
  });
}

export function captureServerError(
  error: unknown,
  options: {
    context?: LogContext;
    event?: H3Event;
    message?: string;
  } = {},
) {
  const logger = options.event
    ? createRequestLogger(options.event, {
        defaults: options.context,
      })
    : createServerLogger({
        defaults: options.context,
      });

  logger.error(options.message ?? "Unhandled server error", normalizeError(error));
}
