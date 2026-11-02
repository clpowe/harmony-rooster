# Homepage inspection report

Inspected November 2, 2026 using the **Chrome DevTools MCP** at
`http://harmony-rooster.localhost:1355/` in an isolated browser context.

## Scope and result

Reviewed the rendered DOM/accessibility tree, matched CSS and computed dimensions,
desktop/mobile screenshots, console messages, and network requests. Checked widths
of 320, 390, 768, 896, 1024, and 1440 CSS pixels; mobile interaction checks used
390 × 844 with touch emulation and DPR 2.

**Eight findings: one high, five medium, two low.** No critical page blocker was
reproduced. The largest practical problem is image weight. The main layout holds
together at the tested widths; this does not call for a wholesale redesign.

Visual anti-pattern assessment: no redesign blocker. The photography, rooster
identity, and teal/orange palette form a consistent brand. Repeated rounded panels
are a secondary aesthetic consideration, not a verified usability defect.

## Prioritized findings

| ID  | Severity | Area                | What needs fixing                                                |
| --- | -------- | ------------------- | ---------------------------------------------------------------- |
| 1   | High     | Performance         | About Us downloads a 16.3 MB original JPEG                       |
| 2   | Medium   | Navigation          | Privacy and Accessibility point to nonexistent anchors           |
| 3   | Medium   | Runtime/CSP         | An inline image event handler is blocked on page load            |
| 4   | Medium   | Semantics           | Homepage has no H1; the main headline is a paragraph             |
| 5   | Medium   | Responsive controls | Small-button styles override the mobile touch-size rule          |
| 6   | Medium   | Form accessibility  | Invalid submission gives no focus movement or error announcement |
| 7   | Low      | Keyboard navigation | Escape closes mobile navigation without restoring focus          |
| 8   | Low      | Metadata            | Unhead reports ignored async work and deprecated metadata        |

### 1. Resize and compress the About Us image

- **Evidence:** `/asiannurse.jpg` has intrinsic dimensions of **7728 × 5152**.
  Resource Timing reported **16,316,613 response-body bytes** and **16,316,913
  transferred bytes**. Its desktop rendered size was only **608 × 456**.
- **Location:** [about-us.vue](../../../app/components/about-us.vue), image near line 4.
- **Impact:** A large, unnecessary download for a secondary image, particularly
  expensive on mobile connections. Localhost's short transfer time does not
  represent real-user performance.
- **Fix:** Serve compressed WebP/AVIF variants through `NuxtImg` or pre-generated
  responsive sources, with `sizes` matching the actual one/two-column layout.
  Keep lazy loading and explicit dimensions. Aim for hundreds of KB, then verify
  visual quality and the actual transferred size at mobile and desktop DPRs.
- **Related optimization:** On a fresh 390 px / DPR 2 load, the 358 px-wide hero
  selected a **1920 × 1308** image. Its `sizes` configuration declares 960 px for
  small screens. Match that declaration to the real rendered width, including the
  hero's gutters, instead of requesting an unnecessarily large mobile source.
  See [new-hero.vue](../../../app/components/new-hero.vue), lines 3–8.

### 2. Give Privacy and Accessibility working destinations

- **Evidence:** Footer links use `/#privacy` and `/#accessibility`; neither ID
  exists in the rendered document. Other homepage hash targets exist.
- **Location:** [page-footer.vue](../../../app/components/page-footer.vue), lines 16–17.
- **Impact:** Users cannot reach either advertised document through these links.
- **Fix:** Link to real pages or add the intended content sections with matching
  IDs. Verify navigation from both the homepage and internal routes.

### 3. Resolve the image-handler/CSP incompatibility

- **Evidence:** Both the initial desktop load and a cache-bypassing mobile reload
  emitted an error that `script-src-attr 'none'` blocked an inline event handler.
  A `securitypolicyviolation` listener independently captured
  `effectiveDirective: "script-src-attr"`, `blockedURI: "inline"`.
  The rendered hero image includes
  `onerror="this.setAttribute('data-error', 1)"`; it was the only inline event
  attribute found in the inspected DOM.
- **Location:** Rendered `NuxtImg` from
  [new-hero.vue](../../../app/components/new-hero.vue), near line 3;
  `@nuxt/image` and `nuxt-security` are enabled in
  [nuxt.config.ts](../../../nuxt.config.ts).
- **Impact:** The browser blocks inline behavior and logs a real runtime policy
  error. Successful images displayed correctly; a broken hero image/fallback was
  not reproduced. The captured violation did not identify a source line, so the
  image handler is the leading source to investigate, not a proven call stack.
- **Fix:** Make generated image error handling compatible with the CSP, using
  listener-based handling or an appropriate dependency/configuration correction.
  Preserve the restrictive CSP. Recheck a normal load and an intentionally failed
  image in a local test, including a production preview.

### 4. Restore a meaningful page-level heading

- **Evidence:** `document.querySelectorAll('h1')` found no H1. The first heading is
  the H2 eyebrow, “Home care & residential habilitation”; “Care you can trust” is
  rendered as a paragraph.
- **Location:** [new-hero.vue](../../../app/components/new-hero.vue), lines 114–115.
- **Impact:** The visual headline is absent from heading navigation and the page
  hierarchy does not express its main subject clearly.
- **Fix:** Use an H1 for the main headline or a descriptive combined title. Treat
  the eyebrow as supporting text, and preserve appearance with component classes
  rather than relying on element selectors. Update `.content p` styling when
  changing the element. Keep section headings as H2s.
- **Accessibility relevance:** Heading structure and information relationships;
  the missing H1 alone is not being presented as an automatic WCAG failure.

### 5. Fix the touch-size cascade

- **Evidence:** With mobile/touch emulation active, the hero's Apply for care and
  All courses controls measured **32 px high**. Course Register/Details controls
  measured **40 px high**. DevTools matched CSS showed the coarse-pointer
  `.button` minimum-height declaration losing to `.button[data-size="small"]`.
- **Locations:**
  [controls.css](../../../app/assets/css/blocks/controls.css), lines 89–92 and 121–125;
  [exceptions.css](../../../app/assets/css/exceptions.css), near line 47;
  [CourseCard.vue](../../../app/components/CourseCard.vue), near line 104.
- **Impact:** Primary actions are less forgiving to tap than the project's
  44 px touch-target token intends.
- **Fix:** Give the coarse-pointer rule enough specificity to cover size
  variants, or clamp each size to `var(--touch-target)` on touch devices. Verify
  the separate course Details link as well. Preserve space between targets.
- **Standard:** 44 × 44 is the WCAG enhanced/AAA target and a useful usability
  goal. A 32 px control is not, by itself, a WCAG 2.2 AA target-size failure.

### 6. Make failed form validation discoverable

- **Evidence:** Submitting the empty form displayed three specific field errors
  and correctly added `aria-invalid`/`aria-describedby`. Focus remained on Send
  message. Error paragraphs have no live-region role, and no validation summary
  appeared. Required fields expose neither `required` nor `aria-required`.
- **Locations:** [ContactForm.vue](../../../app/components/ContactForm.vue),
  `handleSubmit` near line 31 and fields near line 70;
  [App-TextField.vue](../../../app/components/App-TextField.vue), near line 54.
- **Impact:** Keyboard and screen-reader users receive little immediate guidance
  after a rejected submission, particularly with fields above the submit button.
- **Fix:** Add an invalid-submit handler that focuses the first invalid control
  or a focusable error summary. Announce the error summary appropriately, retain
  field associations, and expose required status in labels and semantics.
- **Verification boundary:** Only empty-form validation was triggered. No
  message was sent and successful delivery/backend failures were not tested.

### 7. Restore focus after closing mobile navigation

- **Reproduction:** Open Menu at 390 px, press Tab to focus Our Services, then
  press Escape. Navigation closes and focus falls back to the document body.
- **Location:** [page-header.vue](../../../app/components/page-header.vue),
  `closeNav` near line 17 and Escape handler near line 25.
- **Impact:** Keyboard users lose their position after dismissing navigation.
- **Fix:** Hold a reference to the menu toggle and restore focus when Escape
  dismisses navigation. Keep route-navigation closure behavior separate so it
  does not unexpectedly refocus the header after following a link.

### 8. Investigate the metadata warnings

- **Evidence:** Fresh desktop and mobile loads both logged:
  - `[unhead] promise ignored: tags:resolve`
  - `[unhead] twitter:card is deprecated. Use Open Graph metadata instead.`
- **Location:** The metadata/SEO integration; page metadata is declared in
  [index.vue](../../../app/pages/index.vue), and `@nuxtjs/seo` is enabled in
  [nuxt.config.ts](../../../nuxt.config.ts). No explicit `twitter:card` declaration
  was found in the inspected application sources.
- **Impact:** The ignored promise may leave intended async metadata unresolved.
  No missing title or description was demonstrated; this remains a diagnostic
  warning, not a proven user-facing metadata failure.
- **Fix:** Trace the responsible module/hook, verify compatible installed
  dependency versions, and correct the async lifecycle or deprecated generated
  metadata at its source. Check SSR HTML and social metadata afterward rather
  than simply suppressing the warnings.

## Console and network results

- The only console error observed was the CSP violation described above. No
  uncaught application exception or Vue hydration-mismatch warning was observed.
- The DevTools CSP issue entry corresponds to that same violation; it is not a
  second independent failure.
- All **398 recorded requests** in the final fresh mobile navigation had
  successful HTTP status codes. The desktop request list also contained no
  failed request or HTTP error. This includes development modules, so the count
  is not representative of production bundling.
- Images, fonts, and stylesheets loaded. No `/api/contact` request was generated
  by the empty validation check. Homepage course data was already in the Nuxt
  payload; absence of a failed API request does not prove all backend APIs work.
- Vite connection logs, Suspense's experimental notice, Nuxt DevTools output,
  and Vercel analytics debug messages are development diagnostics, not separate
  reported defects.

## Layout and positive findings

- Document width matched viewport width at all six tested widths; no horizontal
  page scrollbar or clipped heading text was reproduced. A decorative contact
  SVG extends outside its box on desktop but is clipped by its container and
  does not expand the document.
- Service, About Us, FAQ, and contact layouts stack on narrow screens. Header
  navigation switches to the mobile disclosure and opens successfully.
- Menu links show a visible keyboard focus outline. The toggle exposes its
  expanded state. FAQ disclosure opens and displays its answer.
- Images have alternative text. The page has a main landmark, a skip link,
  labeled navigation, visible form labels, and descriptive course-link names.
- The About Us image renders normally once scrolled into view and decoded; an
  initially blank area in a full-page capture was not treated as a layout bug.
- No active page animation was observed during the check; the CSS also contains
  a reduced-motion override. A full motion or contrast audit was not performed.

## Fix order and systemic cause

1. **First:** Optimize the About Us image and correct the two dead footer links.
2. **Next:** Resolve CSP handling, add the H1, repair touch-size specificity, and
   improve form validation feedback.
3. **Then:** Restore menu focus and trace the metadata warnings.

The main CSS issue is competing size declarations: brand exceptions and course
overrides set small control heights while the generic coarse-pointer rule cannot
win the cascade. Correct the shared behavior once and verify component exceptions.
Suggested follow-up skills: `/optimize` for images, `/adapt` for touch sizing, and
`/harden` for validation and keyboard behavior.

## Limits

This is a local development homepage inspection, not a production performance
benchmark, full WCAG conformance audit, or checkout/security review. Internal
course pages, payments, external APD links, successful contact delivery, throttled
network behavior, and production builds were not exercised. No application code
was changed, so no build or test run was needed for this report-only task.
