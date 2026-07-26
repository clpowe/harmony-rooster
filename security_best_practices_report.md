# Security Review Report

Date: 2026-07-25

Scope: Nuxt application code, Nitro API handlers/plugins, Stripe Checkout and webhook fulfillment, Airtable/Redis/Resend integrations, runtime configuration, client build artifacts, and locally installed direct dependencies.

This was a source and configuration review. It did not include penetration testing against a deployed environment, access to provider dashboards, or changes to application code.

## Executive summary

No critical vulnerability was found. Two high-severity payment-integrity issues should be fixed before relying on the current registration flow in production:

1. An unauthenticated caller can select an existing Airtable/Stripe customer using only an email address. Stripe Checkout can then expose and offer that customer's redisplayable saved cards and billing details.
2. Capacity is checked only after payment and is not serialized by course session. Concurrent checkouts can oversell a final seat, corrupt Airtable's registration links, and leave a paid customer without a registration or automated refund.

The review also found medium risks involving Checkout Session ID exposure, public-endpoint abuse, sensitive telemetry, callback URL construction, webhook atomicity, and deployment-dependent request-size enforcement. The application has several important controls already in place: Stripe webhook signatures are verified over the raw body, fulfillment re-retrieves and verifies paid Checkout state, prices are server-authoritative, Airtable formula input is escaped, Vue output is escaped, and private credentials are kept out of the client runtime configuration.

## Risk summary

| ID             | Severity            | Finding                                                                                       |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| APP-AUTHZ-001  | High                | Email-only lookup can expose another customer's Stripe Checkout state                         |
| APP-RACE-001   | High                | Seat allocation can oversell and corrupt paid registrations                                   |
| APP-CAP-001    | Medium              | Checkout Session IDs act as unbound receipt capabilities and leak into telemetry              |
| APP-ABUSE-001  | Medium              | Public write endpoints can bypass rate limits and consume provider resources                  |
| APP-LOG-001    | Medium              | Logs export query values, PII, identifiers, and unsanitized exceptions                        |
| APP-HOST-001   | Medium, conditional | Request Host can control Stripe callback URLs when canonical configuration fails              |
| APP-IDEMP-001  | Medium              | Fulfillment idempotency has crash windows and unsafe lock release                             |
| APP-DOS-001    | Medium, conditional | Chunked bodies can bypass the configured request-size check                                   |
| APP-BUILD-001  | Low                 | Public production source maps disclose original frontend source                               |
| APP-SUPPLY-001 | Low                 | Unused production CLI packages expand the dependency attack surface                           |
| APP-ERR-001    | Low                 | Registration validation and upstream error handling permit avoidable disclosure/amplification |

## Detailed findings

### APP-AUTHZ-001 — Email-only lookup can expose another customer's Stripe Checkout state

Severity: High

Locations:

- `server/api/courses.post.ts:113-144`
- `server/api/courses.post.ts:179-194`
- `server/api/courses.post.ts:211-215`
- `server/api/courses.post.test.ts:107-140`

Evidence:

The unauthenticated registration endpoint accepts an email address, selects the first Airtable customer with that email, and passes the associated Stripe Customer ID to `stripe.checkout.sessions.create`. There is no account session, email challenge, or other proof that the caller owns the selected customer. Existing tests explicitly preserve this reuse behavior.

Stripe documents that, in payment mode, passing an existing Customer can prefill the email, name, card details, and billing address from saved payment methods. Its existing-customer Checkout flow can display up to 50 redisplayable saved cards. See [Stripe's existing-customer Checkout guidance](https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted) and the [`customer` parameter reference](https://docs.stripe.com/api/checkout/sessions/create).

Impact/exploit:

An attacker who knows a registrant's email and a public course session ID can obtain a Stripe-hosted Checkout URL bound to the victim's Customer. If that Customer has redisplayable saved methods, the attacker can view saved-card/billing state and may be able to submit payment with a displayed method. Even where no saved method exists, the resulting payment, Airtable registration, and receipt are associated with the wrong customer, enabling record poisoning and harassment.

Recommended fix:

- Do not pass an existing `customer` for this unauthenticated flow. Use guest Checkout or a checkout-scoped pending customer instead.
- If customer reuse is required, verify ownership with an authenticated account or email magic link/OTP before mapping to the Stripe Customer ID.
- Merge pending records into durable Airtable/Stripe identities only after verification.
- Add a regression test proving that a submitted email alone cannot select an existing Stripe Customer.

Mitigation/qualification:

If the Stripe account has no saved methods marked for redisplay, saved-card exposure is reduced. The identity and record-integrity issue still exists.

### APP-RACE-001 — Seat allocation can oversell and corrupt paid registrations

Severity: High

Locations:

- `server/api/courses.post.ts:22-30`
- `server/api/courses.post.ts:126-205`
- `server/api/courses.post.ts:211-238`
- `server/services/stripe-fulfillment.ts:458-493`
- `server/services/stripe-fulfillment.ts:564-567`
- `server/services/stripe-fulfillment.ts:633-639`
- `server/services/stripe-fulfillment.ts:725-740`
- `server/services/stripe-fulfillment.test.ts:560-577`

Evidence:

Checkout creation does not load or validate `spotsAvailable`, so a direct caller can create and pay for a full session. Fulfillment checks a later Airtable snapshot, but its Redis lock is keyed by Checkout Session ID rather than the internal course-session ID. Two distinct paid checkouts for the final seat can therefore both read the same availability and registrations array, both pass validation, and both insert paid registrations. Their subsequent stale array updates can overwrite or unlink one another.

There is no automated refund, reservation, or remediation path when payment has succeeded but allocation fails. Existing tests cover zero seats and sequential retries for one Checkout Session, not concurrent different checkouts competing for one seat.

Impact/exploit:

Normal concurrency or deliberate parallel payments can oversell a class, orphan Airtable records, mark inconsistent fulfillment records as complete, and charge a customer who receives no valid seat.

Recommended fix:

- Serialize allocation by internal course-session ID using a renewable, owner-checked distributed lock, or use an atomic/transactional capacity decrement.
- Refetch authoritative capacity and registrations inside the critical section.
- Add a durable unique constraint on Checkout Session ID at the registration layer.
- Reserve inventory before payment with expiration, or implement an explicit refund/remediation workflow when allocation is lost after payment.
- Add a concurrency test with two different Checkout Sessions and one remaining seat.

Mitigation/qualification:

Low traffic reduces frequency but does not make the operation atomic. Airtable formulas and per-checkout idempotency do not prevent this cross-checkout race.

### APP-CAP-001 — Checkout Session IDs act as unbound receipt capabilities and leak into telemetry

Severity: Medium

Locations:

- `server/api/stripe/success.ts:25-86`
- `server/api/courses.post.ts:207-209`
- `app/pages/success.vue:29-50`
- `nuxt.config.ts:71-79`
- `server/utils/logger.ts:297-315`
- `server/api/stripe/success.test.ts:104-133`

Evidence:

`/api/stripe/success` accepts any supplied `session_id`, retrieves it with the server Stripe credential, and returns payment status, total, card brand/last four, plus the class date, time, and location. It does not bind the ID to an authenticated user, browser cookie, or short-lived application nonce. The ID remains in the success-page URL.

The installed PostHog client defaults to automatic pageview capture and includes the current URL. The application does not remove or sanitize `session_id` before PostHog initialization. Server error logs also record the full request path, including query strings.

Impact/exploit:

Checkout Session IDs are high entropy, so blind guessing is not practical. However, anyone who obtains a URL from analytics, error logs, browser history, screenshots, or copied links can query the endpoint and retrieve receipt metadata. Telemetry creates a concrete secondary disclosure path for the capability.

Recommended fix:

- Bind receipt access to an authenticated identity or a short-lived, single-purpose HttpOnly nonce issued before redirecting to Stripe.
- Return only fields that the confirmation page strictly needs; reconsider card brand/last four and location.
- Set `Cache-Control: no-store` on the API and page response.
- Remove the query from browser history after consuming it.
- Disable automatic pageview capture for this route or strip sensitive query parameters in PostHog's `before_send`/URL sanitization configuration.
- Add authorization, no-store, and analytics-scrubbing tests.

Mitigation/qualification:

The current response already omits names, email addresses, full card data, and internal customer IDs. That limits impact but does not provide caller authorization.

### APP-ABUSE-001 — Public write endpoints can bypass rate limits and consume provider resources

Severity: Medium

Locations:

- `server/api/contact.post.ts:28-47`
- `server/api/contact.post.ts:116-126`
- `server/api/courses.post.ts:101-194`
- `nuxt.config.ts:34-44`

Evidence:

The contact limiter unconditionally accepts `X-Forwarded-For`, performs separate non-atomic read/write operations, stores each unique IP without an explicit TTL, and uses Nitro's default cache storage. The globally enabled `nuxt-security` limiter is also configured with its default per-process LRU store and forwarded-IP behavior.

The registration endpoint accepts public session IDs and creates durable Airtable customer records and Stripe Customer objects before payment completes. It has no route-specific bot challenge or stronger distributed quota. Rotating/spoofing forwarded IPs or targeting multiple application instances bypasses the effective limits; parallel requests can also exceed the contact limit because its update is not atomic.

Impact/exploit:

An attacker can fill Airtable with junk customers, create large numbers of Stripe Customer/Checkout objects, consume third-party quotas, fill node-local cache keys, and spam the contact inbox.

Recommended fix:

- Derive the client address only from a trusted edge that overwrites forwarding headers, and block direct origin access.
- Use an atomic Redis/Upstash limiter with expiry and route-specific policies for registration and contact.
- Add a bot challenge or proof-of-work where appropriate.
- Defer durable customer creation until a verified payment/identity state, or use expiring pending records.
- Test spoofed forwarding headers, parallel requests, and multi-instance accounting.

Mitigation/qualification:

A production edge that overwrites `X-Forwarded-For` mitigates spoofing. It does not address non-atomic updates, per-process accounting, missing TTL on the custom keys, or pre-payment resource creation.

### APP-LOG-001 — Logs export query values, PII, identifiers, and unsanitized exceptions

Severity: Medium

Locations:

- `server/utils/logger.ts:42-43`
- `server/utils/logger.ts:89-141`
- `server/utils/logger.ts:252-267`
- `server/utils/logger.ts:297-339`
- `server/plugins/logging.ts:14-35`
- `server/services/stripe-fulfillment.ts:345-351`
- `server/services/stripe-fulfillment.ts:584-592`
- `server/services/stripe-fulfillment.ts:685-691`
- `nuxt.config.ts:5-10`

Evidence:

The logger stores `event.path` under `route`, including query parameters. Redaction is based only on key names matching `authorization`, `cookie`, `email`, `password`, `secret`, `signature`, or `token`. Values embedded under `route`, `errorMessage`, and `errorStack` are retained. Fulfillment logs a `registrationName` containing the customer's first and last name, along with Checkout, Stripe Customer, Airtable customer, registration, and session identifiers. Production enables export to PostHog.

Impact/exploit:

A failed receipt request can put a Checkout Session ID in console and PostHog logs. Upstream exceptions can copy request/provider details into `errorMessage` or stack fields. Operational staff, vendor access, excess retention, or a telemetry compromise would expose data that is not required for observability.

Recommended fix:

- Log only the URL pathname; never log raw queries.
- Replace key-pattern redaction with an allowlist of structured attributes and value-aware scrubbing.
- Drop customer names and hash opaque IDs when correlation is necessary.
- Sanitize and truncate exception messages/stacks before export.
- Define PostHog retention and access controls for server logs.
- Add tests for sensitive values nested in route strings, errors, and attacker-controlled request IDs.

Mitigation/qualification:

Restricted PostHog access and short retention reduce impact but do not remove unnecessary collection.

### APP-HOST-001 — Request Host can control Stripe callback URLs when canonical configuration fails

Severity: Medium, conditional

Locations:

- `nuxt.config.ts:54-55`
- `server/api/courses.post.ts:87-99`
- `server/api/courses.post.ts:207-209`
- `server/api/courses.post.test.ts:233-249`

Evidence:

The canonical site URL defaults to an empty string. When it is missing or invalid, Checkout creation falls back to `getRequestURL(event).origin`, which is derived from the request host. A test explicitly preserves this fallback behavior.

Impact/exploit:

If a production proxy accepts an attacker-controlled Host header, an attacker can create a valid Stripe Checkout Session whose success and cancellation URLs point to an attacker domain. A buyer following that Checkout link can be redirected to the attacker after payment, disclosing the Checkout Session ID and enabling a convincing post-payment phishing flow.

Recommended fix:

- Require a configured, allowlisted HTTPS canonical origin in production and fail closed when it is absent or invalid.
- Reject unknown Host headers at the edge and application boundary.
- Do not derive security-sensitive third-party callbacks from a request header.
- Replace the fallback test with a production failure test and an allowlist test.

Mitigation/qualification:

This is not exploitable if production always supplies a valid canonical URL and the edge rejects unknown hosts. The repository does not enforce either condition.

### APP-IDEMP-001 — Fulfillment idempotency has crash windows and unsafe lock release

Severity: Medium

Locations:

- `server/services/stripe-fulfillment.ts:458-527`
- `server/services/stripe-fulfillment.ts:693-712`
- `server/services/stripe-fulfillment.ts:892-913`
- `server/services/stripe-fulfillment.test.ts:614-643`

Evidence:

The Airtable registration insert occurs before its ID is durably saved in Redis. A process crash or Redis write failure during that window leaves a created registration that a retry cannot identify, so the retry inserts another. The 15-minute lock stores the event ID but `releaseFulfillmentLock` performs an unconditional `DEL`. If an old worker outlives the TTL, a new worker can acquire the lock and the old worker can then delete the new owner's lock.

Existing tests cover the safer failure window after `registrationId` has been persisted, not failure between the Airtable insert and Redis write or a lock-expiry ownership race.

Impact/exploit:

Provider latency, crashes, deliberate webhook pressure, or long-running workers can produce duplicate registrations or concurrent fulfillment for one Checkout Session, corrupting paid-order state.

Recommended fix:

- Enforce a durable unique Checkout Session ID on the Airtable registration itself; Redis should not be the sole idempotency authority.
- Use an outbox/state-machine design so external side effects and their durable state can be reconciled.
- Use a random lock ownership token, compare-and-delete release, and lease renewal.
- Test Redis-write failure immediately after insert and two workers across lock expiry.

Mitigation/qualification:

The current paid-state recheck, Redis `NX` claim, and persisted registration ID correctly handle ordinary sequential Stripe retries. The finding concerns failure/concurrency windows outside those tests.

### APP-DOS-001 — Chunked bodies can bypass the configured request-size check

Severity: Medium, conditional

Locations:

- `server/api/contact.post.ts:97`
- `server/api/courses.post.ts:113`
- `node_modules/nuxt-security/dist/defaultConfig.mjs:41-45`
- generated middleware in `.output/server/chunks/nitro/nitro.mjs:6978-7004`

Evidence:

The installed `nuxt-security` request-size middleware checks the declared `Content-Length`. When a request is chunked or omits that header, `parseInt(undefined)` does not trigger the limit. Both write endpoints then call `readBody`, which buffers/parses the body before Zod validation.

Impact/exploit:

A direct client capable of reaching Nitro can stream oversized JSON without a declared length and consume process memory, potentially causing denial of service.

Recommended fix:

- Enforce a hard body limit at the trusted proxy/platform edge.
- Add a streaming byte-count limit in the application path rather than trusting the declared length.
- Add a chunked/absent-length integration test against the actual production adapter.

Mitigation/qualification:

Many managed platforms and reverse proxies impose their own request-size limits. Verify the production path before assigning final operational severity.

### APP-BUILD-001 — Public production source maps disclose original frontend source

Severity: Low

Locations:

- `nuxt.config.ts:61-68`
- `nuxt.config.ts:80-84`
- `.output/public/_nuxt/*.js.map`

Evidence:

Client source maps are configured as `hidden`. Nuxt documents that `hidden` still generates maps; it only omits references from the final bundle. The current public output contains 21 map files (about 2.3 MB), all with embedded `sourcesContent`, including application pages/components/composables and some developer paths. No private-key pattern was found in those maps. See [Nuxt's source-map configuration](https://nuxt.com/docs/4.x/api/nuxt-config#sourcemap).

The PostHog configuration uses deprecated `project` instead of `projectId`, and its environment-variable names do not match the locally declared `NUXT_POSTHOG_*` names. Upload/deletion can therefore fail while leaving deployable maps in the public output.

Impact/exploit:

If this output is deployed as-is, attackers can retrieve unobfuscated original frontend source, internal route/data-flow details, and path metadata. This accelerates reconnaissance but does not directly expose server credentials.

Recommended fix:

- Use `projectId`, the correct build-time secret variable, and explicit `deleteAfterUpload: true` for PostHog.
- Fail the build if source-map upload fails or any client `.map` remains in the deployable public directory.
- If private source mapping is unnecessary, set client source maps to `false`.

Mitigation/qualification:

`.output` is Git-ignored and may not match the production artifact. If the deployment pipeline successfully uploads and deletes maps before publishing, this finding is mitigated.

### APP-SUPPLY-001 — Unused production CLI packages expand the dependency attack surface

Severity: Low

Locations:

- `package.json:28-29`
- `pnpm-lock.yaml`

Evidence:

`latest` and `n` are direct production dependencies but have no application references. Both are command-line utilities rather than runtime application libraries. `latest@0.2.0` brings a legacy `npm@2.x` tree into the production dependency graph.

Impact/exploit:

Unused packages increase install-time and transitive supply-chain surface without providing application functionality. This review did not confirm a specific advisory because the npm audit service was unavailable under the current network policy.

Recommended fix:

- Remove unused `latest` and `n` dependencies, regenerate the lockfile, and run the full test/build suite.
- Review other direct dependencies for actual imports and move build-only packages to `devDependencies`.
- Run an approved dependency audit in CI and fail on actionable production advisories.

Mitigation/qualification:

Neither package was found to be imported or executed by the application, so direct runtime exploitability is low.

### APP-ERR-001 — Registration validation and upstream error handling permit avoidable disclosure/amplification

Severity: Low

Locations:

- `server/api/courses.post.ts:15-20`
- `server/api/courses.post.ts:126-134`

Evidence:

The registration email has no explicit 254-character bound, and `sessionId` requires only one character with no maximum or Airtable record-ID format check before it is sent upstream. When Airtable lookup fails, the endpoint returns the provider's raw `error.message` to the unauthenticated caller.

Impact/exploit:

Malformed/oversized values create unnecessary upstream work and log amplification. Provider messages can disclose record-format assumptions, internal identifiers, or future SDK details.

Recommended fix:

- Normalize and cap email at 254 characters.
- Trim, cap, and validate the Airtable record-ID format.
- Return a fixed public `Session not found` message and log a sanitized internal error.
- Reject control characters in names and other values reused in email/metadata.

Mitigation/qualification:

The nominal request-size limit and Airtable's own validation constrain practical impact. They do not justify returning raw provider messages.

## Manual verification and hardening items

- Confirm the production Stripe key is a restricted, environment-specific key with only required Customer/Checkout permissions and, where practical, IP restrictions. The repository accepts a generic `STRIPE_SECRET_KEY`; source review cannot prove production Dashboard settings.
- Confirm the production edge overwrites forwarded IP headers, rejects unknown Host headers, blocks direct-origin traffic, and applies a hard request-body limit.
- Confirm the hard-coded `harmonyrooster@gmail.com` recipient in `server/api/contact.post.ts:120-125` is an approved business inbox for contact-form PII.
- Give receipt delivery its own retryable outbox/idempotency state. Currently a receipt failure is swallowed after fulfillment is marked complete, and provider acceptance followed by a state-write failure is ambiguous.
- Remove the public ngrok hostname from `vite.server.allowedHosts` when it is no longer required for local development.
- Define PostHog access, retention, and sensitive-URL handling policies.

## Positive controls observed

- Stripe webhooks verify the signature against the raw body.
- `checkout.session.async_payment_failed` is ignored; fulfillment re-retrieves Checkout and requires `mode=payment`, `payment_status=paid`, and `status=complete`.
- Required fulfillment metadata and Airtable-to-Stripe Customer IDs are cross-checked.
- Product and price values come from Airtable rather than the request.
- The Airtable email lookup lowercases/trims input and escapes formula backslashes and quotes.
- Success responses exclude customer names, email addresses, full card data, and internal Customer IDs.
- Contact values are normalized and length-bounded; contact email is plain text and provider failures use a generic client message.
- Vue-rendered application and receipt content uses escaped text nodes; no application-owned `v-html`, `innerHTML`, `eval`, `new Function`, `javascript:` URL, browser token storage, or dynamic script injection was found.
- `nuxt-security` supplies CSP, HSTS, no-referrer, framing, MIME-sniffing, and permissions controls in the generated runtime.
- `.env` files are ignored, and the tracked-source secret scan found no credible private credential. Airtable base/table IDs and the PostHog project capture key are identifiers, not authorization secrets.

## Validation and limitations

- The review examined all application/server/shared source files and relevant tests, inspected generated runtime configuration and public source maps, and performed a redacted tracked-file secret scan.
- `pnpm audit --prod --json` could not reach the npm registry from the sandbox. The escalated request was declined because it would disclose the dependency manifest to a third party, so dependency advisory status remains unverified rather than clean.
- A production server could not be bound inside the sandbox (`listen EPERM`), so proxy/adapter behavior, live response headers, cache behavior, Host validation, and request-size enforcement require deployment-level verification.
- No application code or configuration was changed as part of this review. This report is the only new file.
