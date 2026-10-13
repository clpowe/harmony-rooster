# Stripe Fulfillment Hardening Plan

> **For sub-agents:** Execute **only** the task you were assigned. Edit **only** the files listed under that task's **Files**. Do not commit; the orchestrator commits after each wave. Report back: files changed, a short summary of behavior changes, and the output of the test command(s) listed in your task.

**Goal:** Fix the verified defects from the adversarial review of the Stripe cleanup (`d9cef60..78fa003`) without changing the purchase workflow.

**Tech stack:** Nuxt 4, Nitro, TypeScript, Stripe, airtable-ts, Upstash Redis, Resend, Vitest (`pnpm test`, which runs `vp test`).

**Run a single test file:** `pnpm test server/services/stripe-fulfillment.test.ts`

---

## Verified facts (do not re-derive)

- **Airtable links are reciprocal.** Session field `Registrations` (`flde2oTox7tBWtTyf`) is the inverse of Registration field `Session` (`fldpnRrwRk6vE4sPz`). Inserting a registration with `Session: [id]` already links it to the session.
- **`spots-available` = `capacity` − `COUNT(Registrations)`** (formula field `fldALwfXWBdcPOwFj`). A registration that has been inserted therefore already counts against capacity.
- **stripe-node accepts an empty webhook secret.** `constructEvent(body, sig, "")` computes the HMAC with an empty key, so signatures can be forged when `NUXT_STRIPE_WEBHOOK_SECRET_KEY` is unset.
- **airtable.js does not encode record IDs.** It builds the path as `"/" + table + "/" + id` (`node_modules/.pnpm/airtable@0.12.2/node_modules/airtable/lib/record.js:95`).
- **Two copies of h3 are installed.** Nitro resolves `h3@1.15.11`; `package.json` pins `h3@1.15.5`, which `pnpm audit` flags (GHSA-22cc-p3c6-wpvm and others).
- **A failed receipt is never retried.** Once a record is `fulfilled`, `isHandledRecord` returns true, so a redelivery returns `already_handled`. The `!claim.record.receiptSentAt` guard in `fulfillCheckout` is therefore dead code.
- **The catch block of `fulfillCheckout` is safe to rethrow from.** When the record is already `fulfilled`, it rethrows without writing (`stripe-fulfillment.ts:457`).
- **`FakeAirtable` in `stripe-fulfillment.test.ts` does not model reciprocal links.** `insert` does not touch `sessions`.

---

## Execution waves

| Wave | Tasks (run in parallel within a wave)                            | Precondition                     |
| ---- | ---------------------------------------------------------------- | -------------------------------- |
| 0    | Orchestrator: `git switch -c stripe-hardening` from `main`       | Clean tree                       |
| 1    | T1, T2, T3, T4                                                   | Wave 0                           |
| 2    | T5                                                               | T1 and T2 merged in working tree |
| 3    | T6 (dependency bump + full verification + adversarial re-review) | T5 done                          |

**Model assignment:** implementation sub-tasks T1–T5 run on **Sonnet 5.5** (`model: "sonnet"`). The orchestrator (wave reconciliation, diff review between waves, commits) and T6 (verification + adversarial re-review) run on **Opus 5.5**.

File ownership is disjoint inside each wave, so no worktrees are needed. Agents must not run `pnpm install` before Wave 3.

After each wave, the orchestrator runs `pnpm test` and commits with the message given in the task.

---

## Task T1: Fulfillment core fixes

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`

**Do not touch:** the receipt-email block in `fulfillCheckout` (lines around `// Send Email Receipt`), `markReceiptSent`, or `receipt-emails.ts`. T5 owns those.

### Step 1: Fail closed on a missing webhook secret

In `verifyStripeWebhook`, after reading `config`:

- If `config.stripeWebhookSecretKey` is not a string starting with `whsec_`, call `captureServerError` (operation `verify-stripe-webhook`), then throw `createError({ statusCode: 500, statusMessage: "Server Misconfiguration", message: "Stripe webhook secret is not configured" })`.
- `constructEvent` must not be called in that case.

Tests to add:

- An empty secret throws a 500, and `constructEvent` is not called.
- A secret without the `whsec_` prefix throws a 500.
- The existing `whsec_test` path still works.

### Step 2: Remove the redundant session write

The schema facts above mean `createRegistration` must not update the session.

- In `createRegistration`, delete the `nextRegistrations` computation, the `airtable.update(sessionsTable, …)` call, and the whole catch block, including the `airtable.table()` schema introspection.
- Keep: insert the registration, then persist `registrationId` with `writeFulfillmentRecord`, then return `{ id }`.

Test updates:

- Change `FakeAirtable.insert` to model the reciprocal link. When the payload has `Session: [sessionId]` and that session exists, append the new id to `session.registrations` and recompute `spotsAvailable = capacity - registrations.length`.
- Remove `failSessionUpdateOnce` and the tests that depend on it. Replace them with a test asserting that `airtable.update` is never called for the sessions table during fulfillment.
- Existing assertions such as `sessions.get("sess_airtable").registrations == ["reg_1"]` should still pass through the reciprocal fake.

### Step 3: Retries must not count their own registration against capacity

In `fulfillCheckout`, replace the `sessionIsFull` computation with:

```ts
const registrations = context.session.registrations ?? [];
const ownsSeat =
  Boolean(claim.record.registrationId) && registrations.includes(claim.record.registrationId!);
const sessionIsFull =
  !ownsSeat &&
  (context.session.spotsAvailable <= 0 || registrations.length >= context.session.capacity);
```

Leave the `manual_review` and refund branches unchanged. They now run only when the seat is not already ours.

Tests to add:

- **Last seat with a partial failure.** Use `capacity: 1`. The first attempt inserts `reg_1`, then the Redis write that marks the record `fulfilled` fails once: make the `FakeRedis.set` call whose value contains `"status":"fulfilled"` throw once. On retry, the record ends `fulfilled` with `registrationId: "reg_1"`. There is exactly 1 registration, no refund, and the status is not `manual_review`.
- **The existing test "requires manual review when a retry cannot rule out an earlier registration" still passes.** Its `registrationId` is absent and `reg_unknown` is not ours.

### Step 4: Log the original error before touching Redis in the catch block

In the `catch` of `fulfillCheckout`:

- Call `captureServerError(error, …)` first, without `existingRecord` in its context.
- Then read the record inside its own `try/catch`. If that read throws, capture the Redis error as a separate event (`operation: "fulfill-checkout.read-record"`) and `throw error`, the original error. Skip the failure write in that case.
- Keep all other branching identical.

Test to add: make `retrieve` reject, and make `FakeRedis.get` reject on the call inside the catch block. Assert that the original Stripe error is what `fulfillCheckout` rejects with.

### Step 5: Trim stale config type

Remove `resendApiKey`, `contactFromEmail`, and the `posthog*` fields from `SafeRuntimeConfig`. Fulfillment no longer reads them. Keep `airtableKey` and `stripeWebhookSecretKey`.

**Verify:** `pnpm test server/services/stripe-fulfillment.test.ts server/api/stripe/webhook.post.test.ts`

**Commit (orchestrator):** `fix(stripe): fail closed on webhook secret, drop redundant session write, fix retry capacity check`

---

## Task T2: Receipt email module

**Files:**

- Modify: `server/services/receipt-emails.ts`
- Modify: `server/services/receipt-email.test.ts`

### Interface contract (T5 depends on this exactly)

```ts
export type ReceiptEmailInput = {
  // existing fields unchanged …
  idempotencyKey?: string; // T5 makes this required
};
export async function sendReceiptEmail(
  receipt: ReceiptEmailInput,
  event: H3Event,
  deps?: ReceiptEmailDependencies,
): Promise<{ id: string }>;
```

### Step 1: Idempotent send

Pass Resend's idempotency option when it is provided: `resend.emails.send(payload, { idempotencyKey: receipt.idempotencyKey })`.

- First confirm the option name and signature in `node_modules/resend` type definitions. If the installed version does not support it, stop and report instead of improvising.
- Update `getResendClient`'s type so the test fake can capture the second argument.

### Step 2: Configurable sender

`from` = `config.public.receiptFromEmail || config.public.contactFromEmail || "contact@harmonyroosters.com"`. Add `receiptFromEmail` to the `getRuntimeConfig` return type. The `supportEmail` fallback logic is unchanged.

### Step 3: Subject hygiene

Build the subject with CR/LF collapsed: `` `Receipt for ${name} - ${date}`.replace(/[\r\n]+/g, " ") ``.

Tests:

- The idempotency key is forwarded.
- `receiptFromEmail` wins over `contactFromEmail`, which wins over the default.
- A newline in `sessionName` does not appear in the subject.

**Verify:** `pnpm test server/services/receipt-email.test.ts`

**Commit (orchestrator):** `feat(email): idempotent receipt sends and configurable sender`

---

## Task T3: Checkout creation input hardening

**Files:**

- Modify: `server/api/courses.post.ts`
- Modify: `server/api/courses.post.test.ts`

### Step 1: Strict record ID

`sessionId: z.string().regex(/^rec[A-Za-z0-9]{14}$/, "Invalid session ID")`. Update test fixtures that use non-`rec` ids.

### Step 2: Generic not-found error

In the `db.get` catch, return `message: "Session not found"`. Do not reflect `error.message`.

### Step 3: Small correctness fixes

- `email.toLocaleLowerCase()` becomes `email.toLowerCase()`.
- In the Stripe customer metadata, rename the key `sessionId: user.id` to `airtableCustomerId: user.id`. Grep first to confirm nothing reads `sessionId` from Stripe customer metadata.
- Remove `email` from the Checkout Session `metadata`. Before removing it, grep `server/` and `app/` for `metadata.email` / `metadata?.email` and confirm there are no readers. If there is a reader, leave it and report.

Tests:

- `../tblX/recY` and `rec123` are rejected with 400, and no Airtable call is made.
- The not-found response does not contain the underlying error text.

**Verify:** `pnpm test server/api/courses.post.test.ts`

**Commit (orchestrator):** `fix(checkout): validate Airtable record IDs and stop reflecting upstream errors`

---

## Task T4: Hygiene

**Files:**

- Modify: `.gitignore`
- Modify: `server/services/registration-outcome.ts`

Steps:

1. In `.gitignore`, delete the trailing `.env*` line, which overrides `!.env.example`. Keep `.vercel`. Verify with `git check-ignore -v .env.example`: there should be no output. Also confirm `.env` and `.env.local` are still ignored.
2. In `registration-outcome.ts`, rename `consfig` to `config`.

**Verify:** `pnpm test server/services/registration-outcome.test.ts`

**Commit (orchestrator):** `chore: restore .env.example negation and fix typo`

---

## Task T5: Receipt delivery state machine (Wave 2)

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`
- Modify: `server/services/receipt-emails.ts` (only to make `idempotencyKey` required)

**Precondition:** T1 and T2 changes are present in the working tree.

### Design (follow exactly)

- **Registration status never leaves `fulfilled` because of email.** Do **not** re-claim fulfilled records or set them back to `processing`. Doing so would break `reconcileRefund`'s fulfilled guard and the success page, and would trigger capacity checks.
- **Add a receipt-only redelivery path.** `claimFulfillment` returns a new non-ok reason, `"receipt_pending"`, when the existing record has `status === "fulfilled" && !receiptSentAt && (receiptAttemptCount ?? 0) < MAX_RECEIPT_ATTEMPTS` (use 5). This happens before any lock is taken, and the record is not written. Add `"receipt_pending"` to `ClaimResult`. Records that are `fulfilled` with `receiptSentAt` set, or that have exhausted their attempts, stay `already_handled`.
- **Send the email after the lock is released.**
  - Restructure `fulfillCheckout` so the locked section (claim, context, registration, `markFulfillmentSucceeded`) completes and the `finally` releases the lock _before_ any email is sent.
  - The locked section yields what the receipt needs: `context` and `registrationId`.
  - Both paths call one helper, `deliverReceipt(…)`: the first-time path, and the `receipt_pending` path (which loads the context with `loadCheckoutContext` and takes `registrationId` from the record).
- **`deliverReceipt` owns recording delivery.** It must:
  1. Build `ReceiptEmailInput` with `idempotencyKey: \`receipt:${checkoutSessionId}\``.
  2. Call `dependencies.sendReceiptEmail(input, event)`.
  3. On success, call `markReceiptSent`.
  4. On failure, increment `receiptAttemptCount` on the record (only if it is still `fulfilled`), capture the error with `operation: "send-receipt-email"`, then:
     - If attempts remain, throw `createError({ statusCode: 503, statusMessage: "Receipt Pending", message: "Receipt delivery failed; retry scheduled" })` so Stripe redelivers.
     - If attempts are exhausted, log at error level ("Receipt delivery exhausted; manual follow-up required") and return normally.
- **Inject the sender.** Add `sendReceiptEmail: (input: ReceiptEmailInput, event: H3Event) => Promise<{ id: string }>` to `FulfillmentDependencies`. Wire the real one in `stripeFulfillmentDependencies`. Remove the direct `vi.mock("./receipt-emails")` in tests in favor of the injected fake.
- **`markReceiptSent` only stamps fulfilled records.** If the current record's status is not `fulfilled`, do nothing.
- **Make the field required.** In `receipt-emails.ts`, change `idempotencyKey?: string` to `idempotencyKey: string`.
- **Error routing.** The first-time path's receipt failure must not go through the main catch block's failure-write logic. Throw the 503 from `deliverReceipt` after the try/catch/finally has completed. The main catch would rethrow anyway because the status is `fulfilled`; keep it out of that path for clarity.
- **Type field.** Add `receiptAttemptCount?: number` to `FulfillmentRecord`.

### Tests

- **Replace** the test "keeps a successful registration fulfilled when receipt delivery fails". The first call rejects with status 503, and the record is `fulfilled` with `receiptAttemptCount: 1` and no `receiptSentAt`. A second call with a new event id sends the email, sets `receiptSentAt`, and creates no new registration.
- **Redelivery ignores capacity.** Before the second call, set the session to `spotsAvailable: 0` with other registrations. The receipt is still sent, there is no `manual_review`, and there is no refund.
- **The lock is released before the email is sent.** Assert that the `eval` release call happens before `sendReceiptEmail` is invoked.
- **Attempt cap.** With `receiptAttemptCount: 5`, a redelivery returns `already_handled` semantics: the call resolves and no email is sent.
- **Idempotency key.** `sendReceiptEmail` receives `idempotencyKey: "receipt:cs_test_123"`.
- **`markReceiptSent` on a `refunded` record** does not change it.
- **Status unchanged.** `registration-outcome` is untouched. Assert that a `fulfilled` record without `receiptSentAt` still maps to `confirmed`: add one case in `server/services/registration-outcome.test.ts` if no existing case covers it. This is the only edit allowed in that file.

**Verify:** `pnpm test server/services/stripe-fulfillment.test.ts server/services/receipt-email.test.ts server/services/registration-outcome.test.ts server/api/stripe/webhook.post.test.ts`

**Commit (orchestrator):** `fix(stripe): retry failed receipts without re-claiming fulfilled registrations`

---

## Task T6: Dependency bump, full verification, adversarial re-review (Wave 3)

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

Steps:

1. Change `"h3": "1.15.5"` to `"h3": "^1.15.11"`, which matches the version Nitro resolves. Run `pnpm install`. Do **not** remove the dependency: test files import from `"h3"`, and pnpm is strict about undeclared imports.
2. `pnpm audit --prod 2>&1 | grep -A3 -i "│ h3"` should show no h3 advisories.
3. Run `pnpm test`; all tests must pass.
4. Run `pnpm build`; it must succeed.
5. Re-review `git diff main...HEAD` adversarially:
   - Can any path move a `fulfilled` record to a non-fulfilled status?
   - Can the webhook return 200 without either recording a receipt or exhausting attempts?
   - Is any lock held across a Resend call?
   - Does any user-controlled string reach an Airtable path or `filterByFormula` unvalidated?
   - Report findings as `file:line — problem — fix`. Do not fix them; report only.

**Commit (orchestrator):** `chore(deps): align h3 with nitro`

---

## Decision-gated backlog (do NOT execute without user sign-off)

| ID  | Item                                                                                                                                                                                     | Why gated                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| D1  | Either switch to guest checkout (`customer_email` + `customer_creation`, with Airtable customer created at fulfillment), or restore the `customer.stripeID === checkout.customer` check  | Workflow change: affects receipts, refunds, and Stripe customer history       |
| D2  | Store the Checkout Session ID on the Registration row and look it up before insert, for durable dedup beyond Redis's 30-day TTL and to close the crash window between insert and persist | Requires adding an Airtable field (schema change in the user's base)          |
| D3  | Rate limit plus an idempotency key on `POST /api/courses`                                                                                                                                | Needs a client-generated request id (frontend change) and a choice of limiter |
| D4  | Check capacity before creating a checkout, to stop selling full sessions that must then be refunded                                                                                      | Product decision on UX for full sessions                                      |
| D5  | Treat missing metadata or a missing Airtable record as poison: persist `manual_review` and return 200 instead of a 500 that Stripe retries for 3 days                                    | Changes ops alerting expectations                                             |
| D6  | Re-retrieve refunds from Stripe in `reconcileRefund` instead of trusting the event payload                                                                                               | Defense in depth after T1 step 1; adds an API call per refund event           |
| D7  | Schema snapshot test that asserts the field names used in `server/data/airtable-tables.ts` exist in the base                                                                             | Needs a fixture export of the base schema                                     |

---

## Sub-agent prompt template

```
You are executing Task <Tn> of docs/plans/2026-10-12-stripe-hardening.md in /Users/christopherpowe/Documents/harmony-rooster.
Read the "Verified facts" section and your task section in full before editing.
Edit only the files listed under your task. Do not commit, do not run pnpm install (unless you are T6), do not modify other tasks' files.
When done, report: files changed, behavior changes (bullets), and the full output tail of your Verify command. If a step's precondition is false (e.g. an API option does not exist), stop and report rather than improvising.
```

---

# Follow-up waves (from the T6 adversarial review)

| Wave | Tasks                                                                                                        | Model  | Precondition |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------ | ------------ |
| 5    | T7 (stripe-fulfillment.ts findings 1, 2, 4, 5, 6, 8, 10); T8 (`.gitignore`, done inline by the orchestrator) | Sonnet | `fd84777`    |
| 6    | T9 (separate Redis keys for receipt state; dangling registration check)                                      | Sonnet | T7 committed |
| 7    | T10 (full verification + adversarial re-review)                                                              | Opus   | T9 committed |

## Task T7: Fulfillment follow-ups

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`
- Modify: `server/api/stripe/webhook.post.test.ts` (only if it uses the `whsec_test` secret fixture)

### Step 1 (finding 1): Strict webhook secret format

In `verifyStripeWebhook`:

```ts
const secret =
  typeof config.stripeWebhookSecretKey === "string" ? config.stripeWebhookSecretKey.trim() : "";
if (!/^whsec_[A-Za-z0-9+/=]{24,}$/.test(secret)) {
  /* existing fail-closed block */
}
```

- Pass the trimmed `secret` to `constructEvent`.
- Replace the `whsec_test` fixtures with a realistic value, for example `` `whsec_${"a".repeat(32)}` ``. Define it once as a constant in each test file.
- Tests: `"whsec_"`, `"whsec_ "` and `"whsec_changeme"` are each rejected with no `constructEvent` call. A valid secret with a trailing `\n` is accepted, and the trimmed value is what reaches `constructEvent`.

### Step 2 (finding 2): Receipt-pending at every `already_handled` site in `claimFulfillment`

In both the lock-busy branch and the post-lock recheck, return `reason: isReceiptPending(record) ? "receipt_pending" : "already_handled"`. In the post-lock branch, `finally` already releases the lock because `passLockToCaller` is false.

Test: the pre-lock read sees `processing`. The lock is held by another token, and the record is `fulfilled` without `receiptSentAt` at the second read. The result is `receipt_pending`, and `fulfillCheckout` sends the receipt.

### Step 3 (finding 5): Context loading counts toward receipt attempts

- Change `PendingReceipt` to `{ checkoutSession; metadata: { internalCustomerId; internalSessionId }; registrationId; context?: CheckoutContext }`.
- The `receipt_pending` branch in `fulfillUnderLock` no longer calls `loadCheckoutContext`; it returns without `context`.
- In `deliverReceipt`, `const context = pending.context ?? (await loadCheckoutContext(...))` runs inside the same try whose failure goes through attempt accounting.

Test: in the `receipt_pending` path, a failing Airtable `get` increments `receiptAttemptCount` and throws 503.

### Step 4 (finding 4): Send success vs. record failure

In `deliverReceipt`, split the single try:

- **Send fails:** capture `"Receipt email failed"`, then run the existing attempt accounting.
- **Send succeeds but `markReceiptSent` throws:** capture `"Receipt sent but delivery not recorded"` with `operation: "mark-receipt-sent"`. Throw `createError({ statusCode: 500, statusMessage: "Receipt Not Recorded", message: "Receipt sent but delivery could not be recorded" })`. Do **not** increment attempts.

Test: `markReceiptSent`'s Redis write fails once. The call rejects with 500, `receiptAttemptCount` is unchanged, and on redelivery the send reuses the same idempotency key.

### Step 5 (finding 6): No silent 200s

- After a failed send, if the record is missing, `logger.error("Receipt delivery failed and fulfillment record is missing", …)` before returning.
- If a `receipt_pending` record has no `registrationId`, change the existing `logger.warn` to `logger.error`.

### Step 6 (finding 8): Do not send receipts for refunded charges

In `deliverReceipt`, before sending: if the expanded charge has `refunded === true` or `amount_refunded > 0`, call `logger.warn("Skipping receipt for refunded charge", …)` and return. Do not count an attempt, do not throw, and do not mark the receipt sent.

Test: the charge has `amount_refunded: 500`. The email is not sent, the call resolves, and the record is unchanged.

### Step 7 (finding 10): No unlocked failure writes

In the `fulfillUnderLock` catch block, write the failure record only when `claim?.ok` is true. When `claim` is null or not ok, keep the existing `captureServerError` and rethrow without reading or writing the record.

- Delete the now-unused `: { attemptCount: …, status: "failed", … }` construction branch.
- Update or remove tests that asserted a `failed` record is written when Stripe retrieve or metadata parsing fails before a claim. In your report, list every test you changed in this step, with one line on why.

**Verify:** `pnpm test server/services/stripe-fulfillment.test.ts server/api/stripe/webhook.post.test.ts`, then `pnpm test`.

**Commit (orchestrator):** `fix(stripe): strict webhook secret, receipt-pending at every claim site, no unlocked failure writes`

## Task T8: `.gitignore`

Add `.envrc` on its own line after `.env.*`.

## Task T9: Receipt state in separate Redis keys; dangling registration check

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`

### Step 1 (finding 3): Separate keys

- Add the key helpers `getReceiptSentKey(cs) = \`stripe:fulfillment-receipt-sent:${cs}\`` and `getReceiptAttemptsKey(cs) = \`stripe:fulfillment-receipt-attempts:${cs}\``.
- Extend `RedisClient` to `Pick<Redis, "eval" | "get" | "set" | "incr" | "expire">`.
- **`markReceiptSent(cs, deps)`:**
  - Read the record. If it is not `fulfilled`, return.
  - Otherwise run `set(sentKey, nowIso, { nx: true, ex: THIRTY_DAYS_IN_SECONDS })`.
  - It no longer writes the fulfillment record.
- **Failed-send accounting:**
  - `const attempts = await redis.incr(attemptsKey); await redis.expire(attemptsKey, THIRTY_DAYS_IN_SECONDS);`
  - Use `attempts` for the cap.
  - Do not write the fulfillment record.
  - Keep the "record missing / not fulfilled" checks from T7, which are read-only.
- **New helper `readReceiptState(cs, record, deps)`, returning `{ sent: boolean; attempts: number }`:**
  - `sent` = sent key exists, **or** legacy `record.receiptSentAt` is set. Existing production records carry `receiptSentAt`.
  - `attempts` = `Number(attemptsKey value ?? 0)`, **or** legacy `record.receiptAttemptCount`, whichever is larger.
- `isReceiptPending` becomes async, taking `(record, deps)`, and uses `readReceiptState`. Update all three call sites in `claimFulfillment`.
- Keep `receiptSentAt` and `receiptAttemptCount` on the `FulfillmentRecord` type as legacy read-only fields, with a one-line comment saying so. Nothing writes them any more.
- **`FakeRedis`:**
  - Add `incr` and `expire`.
  - Make sure `set` honors `nx` for any key.
- **Tests:**
  - Concurrent success and failure: one `deliverReceipt` succeeds while another fails. Simulate this by calling `markReceiptSent` and then the failed-send accounting, in either order. The sent key survives, and `receipt_pending` is never returned afterwards.
  - Two concurrent failures produce `attempts === 2`.
  - A legacy record with `receiptSentAt` is `already_handled`.
  - A legacy record with `receiptAttemptCount: 5` and no keys is `already_handled`.

### Step 2 (finding 7): Dangling `registrationId`

In `fulfillUnderLock`, when `claim.record.registrationId` is set but not in `session.registrations`:

1. Call `airtable.get(registrationsTable, registrationId)`.
2. If it rejects with a not-found error, write the record with `status: "manual_review"`, `failureCode: "registration_missing"` (add this to `FulfillmentFailureCode`), `manualReviewAt`, and `lastError`. Return `null`.
   - A not-found error is an `AirtableTsError` with `type === "RESOURCE_NOT_FOUND"`, **or** an error with `statusCode === 404` (airtable.js `find` rejects on 404). Confirm both shapes in `node_modules/airtable-ts/dist` and `node_modules/.pnpm/airtable@0.12.2/node_modules/airtable/lib`.
3. If it resolves, treat it as `ownsSeat = true`, which allows for Airtable link lag, and continue.
4. Any other error propagates, so the delivery is retried.

`FakeAirtable.get` must look up registrations by id when the table is `tbltA95wT9qJKfsz6`. It currently falls through to `customers`.

Tests:

- A dangling id on a session that isn't full leads to `manual_review` with `registration_missing`, no insert, and no email.
- An existing but unlinked id leads to `fulfilled` with no new insert.
- A 500 from `get` rethrows and the record is not marked `manual_review`.

`registration-outcome.ts` already maps `manual_review` to `needs_attention`. Do not edit it.

**Verify:** `pnpm test server/services/stripe-fulfillment.test.ts`, then `pnpm test`.

**Commit (orchestrator):** `fix(stripe): store receipt state in atomic Redis keys and flag dangling registrations`

## Task T10: Verification and adversarial re-review (Opus)

Run `pnpm test` and `pnpm build`, then re-run the T6 Part B questions against `git diff fd84777...HEAD` and the full current files. Add these checks:

- Separate-key atomicity, and the fallback for legacy records.
- Is there any path that sends a receipt for a refunded charge?
- Does the strict secret regex accept real Stripe CLI and Dashboard secrets?

Report only; do not fix.

---

# Wave 8 (from the T10 review)

**Accepted risk (owner decision, 2026-10-12):** a charge refunded in the Dashboard _before_ its webhook is fulfilled still creates a registration. Only the receipt is skipped. The owner considers this operationally impossible, so it is not handled.

**Deferred (pre-existing):**

- The course-session lock has no renewal or fencing.
- `processing` maps to "confirming" indefinitely on the success page.
- Resend returns a 409 when the payload changes under the same idempotency key.

| Wave | Task              | Model  |
| ---- | ----------------- | ------ |
| 8    | T11               | Sonnet |
| 8b   | T12 (diff review) | Opus   |

## Task T11: Unlinked registration, atomic attempts, error-level manual review

**Files:**

- Modify: `server/services/stripe-fulfillment.ts`
- Modify: `server/services/stripe-fulfillment.test.ts`

### Step 1: An existing registration must belong to this session

In the dangling-registration check in `fulfillUnderLock`:

- Keep the result of `airtable.get(registrationsTable, persistedRegistrationId)`.
- Set `ownsSeat = true` only if `registration.Session?.includes(metadata.internalSessionId)`.
- Otherwise, write `manual_review` with `failureCode: "registration_unlinked"` (add it to `FulfillmentFailureCode`), plus `manualReviewAt` and `lastError` naming the registration and checkout ids. Return `null`.
- Fix the comment above the check: links are reciprocal and synchronous, so the case being handled is an admin edit, not lag.

`FakeAirtable` registrations must carry `Session`.

Tests:

- A registration linked to another session ends in `manual_review` with `registration_unlinked`, no insert, and no email.
- A registration linked to this session but missing from the session snapshot ends `fulfilled` with no insert.

### Step 2: Atomic attempt counter

Replace the separate `incr`/`expire` calls with one `eval` of:

```lua
local n = redis.call("INCR", KEYS[1])
redis.call("EXPIRE", KEYS[1], ARGV[1])
return n
```

- Store the script in a module constant named like `RELEASE_LOCK_SCRIPT`.
- Pass `[attemptsKey]` and `[String(THIRTY_DAYS_IN_SECONDS)]`.
- Coerce the result with `Number()`.
- Remove `incr` and `expire` from `RedisClient` if nothing else uses them.
- `FakeRedis.eval` must dispatch on the script (release-lock vs. increment-attempts).
- Existing attempt tests must still pass. Add one that asserts the attempts key has a TTL set (or that `eval` was called with the increment script and TTL argument).

### Step 3: Error-level logging for paid customers without a seat or a receipt

Change these `logger.warn` calls to `logger.error`:

- The capacity `manual_review` branch ("Checkout requires manual capacity review").
- The `registration_missing` branch.
- The new `registration_unlinked` branch.

In `deliverReceipt`, the failed-send branch that returns when the record exists but is not `fulfilled` must call `logger.error("Receipt delivery failed and fulfillment record is not fulfilled", { status: current.status, registrationId })` before returning.

**Verify:** `pnpm test server/services/stripe-fulfillment.test.ts`, then `pnpm test`, then `pnpm exec vp check`.

**Commit (orchestrator):** `fix(stripe): require session link for reused registrations, atomic receipt attempts, error-level manual review`

## Task T12: Diff review (Opus)

Review `git diff 010e302...HEAD` against T11 and the T10 report. Check for regressions in the receipt paths and in claim/lock behavior. Run `pnpm test` and `pnpm build`. Report only.
