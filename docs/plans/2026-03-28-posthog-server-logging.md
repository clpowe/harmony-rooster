# PostHog Server Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add structured backend logging and error capture to the Nuxt/Nitro app using PostHog for preview and production, with local development remaining console-first.

**Architecture:** Introduce a shared server logger and PostHog transport wrapper under `server/utils/`, add a Nitro plugin to provide request IDs and unhandled error logging, and migrate Stripe webhook and fulfillment logging to structured records. Logging must be best-effort, sanitized before transport, and safe to run without PostHog credentials locally.

**Tech Stack:** Nuxt 4/Nitro, TypeScript, H3, PostHog Nuxt module, native `fetch`, Vitest

---

### Task 1: Add runtime config for server log shipping

**Files:**

- Modify: `nuxt.config.ts`

**Step 1: Add runtime config keys**

Add server-side runtime config entries for:

- `posthogHost`
- `posthogProjectApiKey`
- `posthogLogEndpoint`
- `posthogServerLogEnabled`

Keep them default-safe so local development does not require secrets.

**Step 2: Run targeted type/build check**

Run: `pnpm build`
Expected: build succeeds and runtime config usage remains valid.

**Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "chore: add server log runtime config"
```

### Task 2: Create the shared server logger and sanitizer

**Files:**

- Create: `server/utils/logger.ts`
- Create: `server/utils/logger.test.ts`

**Step 1: Write the failing test**

Add tests for:

- sanitizing sensitive keys like `token`, `secret`, `signature`, `email`
- skipping PostHog transport when disabled
- preserving structured fields such as `severity`, `message`, and `source`

**Step 2: Run test to verify it fails**

Run: `pnpm test server/utils/logger.test.ts`
Expected: FAIL because logger module does not exist yet.

**Step 3: Write minimal implementation**

Implement:

- a normalized log type
- a sanitizer for nested metadata
- severity helpers: `debug`, `info`, `warn`, `error`
- `captureServerError(error, context)`
- a best-effort PostHog transport using runtime config

**Step 4: Run test to verify it passes**

Run: `pnpm test server/utils/logger.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add server/utils/logger.ts server/utils/logger.test.ts
git commit -m "feat: add shared server logger"
```

### Task 3: Add request context and unhandled backend error logging

**Files:**

- Create: `server/plugins/logging.ts`
- Modify: `server/tsconfig.json` if Nitro plugin resolution/types need it

**Step 1: Write the failing test or narrow verification target**

If plugin-level testing is awkward in current repo shape, define a narrow verification target:

- request ID helper returns a stable ID for a request
- unhandled errors are normalized and logged through the shared logger

If practical, add a test file:

- `server/plugins/logging.test.ts`

**Step 2: Run verification target to confirm missing behavior**

Run a targeted test if added, otherwise defer to build verification after implementation.

**Step 3: Write minimal implementation**

Implement a Nitro server plugin that:

- creates or propagates a request ID
- stores request metadata on `event.context`
- logs uncaught route errors through the shared logger

**Step 4: Run verification**

Run: `pnpm build`
Expected: PASS and plugin is recognized by Nitro.

**Step 5: Commit**

```bash
git add server/plugins/logging.ts server/tsconfig.json
git commit -m "feat: add nitro request logging hooks"
```

### Task 4: Migrate Stripe webhook handler logging

**Files:**

- Modify: `server/api/stripe/webhook.post.ts`
- Modify: `server/api/stripe/webhook.post.test.ts` if log behavior affects assertions

**Step 1: Write or update failing test**

If existing tests cover webhook handling, extend them to assert logger calls indirectly or at least preserve behavior for:

- ignored non-fulfillment events
- accepted fulfillment events
- successful handler response shape

**Step 2: Run targeted test**

Run: `pnpm test server/api/stripe/webhook.post.test.ts`
Expected: existing or updated test coverage reflects current behavior.

**Step 3: Write minimal implementation**

Replace `console.*` calls with structured logger calls containing:

- `source: "stripe-webhook"`
- `operation`
- `eventId`
- `eventType`
- `checkoutSessionId` where available

**Step 4: Re-run targeted test**

Run: `pnpm test server/api/stripe/webhook.post.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add server/api/stripe/webhook.post.ts server/api/stripe/webhook.post.test.ts
git commit -m "refactor: use structured logging in stripe webhook handler"
```

### Task 5: Migrate Stripe fulfillment service logging and error capture

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`

**Step 1: Write or update failing test**

Extend tests to protect:

- error paths still throw appropriately
- successful fulfillment behavior is unchanged
- handled failures pass through `captureServerError` or structured `error` logging without mutating business behavior

**Step 2: Run targeted tests**

Run: `pnpm test server/services/stripe-fulfillment.test.ts`
Expected: baseline results recorded before migration.

**Step 3: Write minimal implementation**

Replace current `console.log` / `console.error` calls with structured logger calls carrying:

- `source: "stripe-fulfillment"`
- `operation`
- `checkoutSessionId`
- `stripeEventId`
- `recordKey`
- `lockKey`
- relevant status metadata

Use `captureServerError` in the terminal failure path after existing record lookup logic is preserved.

**Step 4: Re-run targeted tests**

Run: `pnpm test server/services/stripe-fulfillment.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add server/services/stripe-fulfillment.ts server/services/stripe-fulfillment.test.ts
git commit -m "refactor: add structured fulfillment logging"
```

### Task 6: Final verification and handoff

**Files:**

- Review only

**Step 1: Run focused tests**

Run:

```bash
pnpm test server/api/stripe/webhook.post.test.ts
pnpm test server/services/stripe-fulfillment.test.ts
pnpm test server/utils/logger.test.ts
```

Expected: PASS

**Step 2: Run build**

Run: `pnpm build`
Expected: PASS

**Step 3: Manual sanity check**

Verify:

- local runs do not require PostHog credentials
- logger still prints meaningful console output
- no obvious secrets are included in structured log metadata

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add posthog server logging"
```
