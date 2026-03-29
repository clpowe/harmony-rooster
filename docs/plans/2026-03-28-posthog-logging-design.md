# PostHog Server Logging Design

**Goal:** Add structured backend logging and error tracking to the Nuxt/Nitro application using PostHog for preview and production environments, with local development remaining console-first.

## Scope

This rollout covers:

- Nitro server/API logging
- Stripe checkout and webhook fulfillment flows
- Airtable/API backend failures generally
- Unhandled backend route errors

This rollout does not attempt to redesign frontend analytics or capture broad client-side product events.

## Current State

- The repo is a Nuxt 3 + TypeScript application.
- `@posthog/nuxt` is already installed and configured in [`nuxt.config.ts`](/Users/christopherpowe/Documents/harmony-rooster/nuxt.config.ts).
- PostHog exception autocapture is already enabled for client and server contexts.
- Backend observability currently relies mostly on `console.log` and `console.error`, especially in Stripe fulfillment code.
- There is no shared server logger, no request-scoped log context, and no central sanitization boundary for logs.

## Requirements

- Route most backend logs through PostHog with explicit severity fields.
- Focus first on Stripe checkout/webhook failures and Airtable/API failures.
- Enable PostHog log shipping only in non-local environments.
- Preserve useful local console output for development.
- Avoid shipping sensitive values such as secrets, tokens, webhook signatures, request bodies, and clear-text emails by default.

## Chosen Approach

Implement a shared server-side logger with a PostHog transport wrapper.

The logger will:

- expose `debug`, `info`, `warn`, `error`
- expose `captureServerError(error, context)`
- support request-scoped metadata through a `createRequestLogger(event)` helper
- write to console in all environments
- ship structured logs to PostHog only in preview and production
- normalize and sanitize context before transport

This keeps the rollout focused and practical while creating a clear path to migrate additional server code away from raw `console.*` calls over time.

## Architecture

### 1. Shared server logger

Create a server-only logger module under `server/utils/` that accepts:

- message
- severity
- source
- operation
- optional domain context such as `checkoutSessionId`, `stripeEventId`, route name, or internal record IDs

The logger will produce a normalized log payload and send it to:

- console
- PostHog log ingestion endpoint when enabled

### 2. PostHog transport

Add a small PostHog transport wrapper responsible for:

- environment gating
- token/host configuration
- HTTP delivery to PostHog logs ingestion
- non-throwing behavior if telemetry transport fails

Transport failures should never break application behavior. They may emit a local console warning in development-safe form.

### 3. Request-scoped context

Add a Nitro server plugin or helper that creates stable request metadata:

- `requestId`
- `route`
- `method`
- `environment`

This context will be reused in route handlers and error logging so related log lines can be filtered and grouped.

### 4. Explicit error capture

Add `captureServerError(error, context)` to:

- normalize unknown thrown values
- extract safe fields such as `name`, `message`, and optional stack
- emit a structured `error` log
- optionally forward the exception to the installed PostHog server SDK when useful

### 5. First-pass migrations

Replace raw `console.*` usage in the highest-value backend paths:

- `server/api/stripe/webhook.post.ts`
- `server/services/stripe-fulfillment.ts`

Additional backend routes can migrate later using the same logger.

## Data Flow

1. A Nitro route or service creates or receives a request-scoped logger.
2. Code emits structured logs with explicit severity and context.
3. The logger sanitizes the metadata.
4. The logger prints to console.
5. In preview/production, the logger forwards the structured record to PostHog logs ingestion.
6. On handled failures, `captureServerError` emits structured error data.
7. On unhandled route failures, a Nitro plugin logs the terminal error with request metadata before the response completes.

## Log Shape

Each record should contain a stable base schema:

- `severity`
- `message`
- `timestamp`
- `source`
- `operation`
- `environment`
- `requestId`
- `route`
- `method`

Optional domain fields:

- `checkoutSessionId`
- `stripeEventId`
- `internalCustomerId`
- `internalSessionId`
- `registrationId`
- `recordKey`
- `lockKey`
- `status`
- `attemptCount`

Error fields:

- `errorName`
- `errorMessage`
- `errorStack` (trimmed and only where acceptable)

## Sanitization Policy

The logger must sanitize before transport.

Default denylist behavior:

- remove keys containing `secret`
- remove keys containing `token`
- remove keys containing `authorization`
- remove keys containing `cookie`
- remove keys containing `signature`
- remove keys containing `password`
- remove keys containing `email`

Additional rules:

- never ship raw request bodies
- never ship full Airtable record payloads
- never ship unbounded arbitrary objects without normalization
- prefer IDs, statuses, counts, and enums over full objects

## Environment Behavior

- Local development: console logging only
- Preview: console + PostHog logs
- Production: console + PostHog logs

This keeps development noise and accidental leakage down while preserving real monitoring in deployed environments.

## Configuration

Runtime config should be expanded to support server logging transport cleanly, for example:

- public PostHog key already used by the Nuxt module
- server-side PostHog token/host values for log ingestion
- an explicit flag to enable or disable server log shipping

The implementation should favor runtime config over hardcoded values so deployment behavior can be changed without code edits.

## Monitoring Views

Recommended saved views in PostHog:

- `severity:error`
- Stripe webhook failures by `operation=verify-stripe-webhook` or `operation=fulfill-checkout`
- Airtable/API backend failures by `source=api` or `source=airtable`
- Fulfillment lifecycle logs grouped by `checkoutSessionId`
- Errors grouped by `route`

## Verification

Minimum verification:

- `pnpm build`
- relevant Stripe fulfillment tests if still valid after refactor
- local sanity check that logger prints to console without needing PostHog credentials
- confirm non-local transport path is environment-gated and non-throwing

## Risks

- Over-logging noisy objects could leak sensitive or high-cardinality fields if sanitization is too weak.
- Using raw network transport in request paths must remain best-effort and low-risk.
- Replacing many existing `console.*` calls requires care to preserve operational context that current logs already provide.

## Outcome

The first pass should deliver:

- initialization code for backend logging
- a reusable custom error capture function
- env-driven PostHog log ingestion configuration
- concrete PostHog dashboard recommendations for Stripe and backend monitoring
