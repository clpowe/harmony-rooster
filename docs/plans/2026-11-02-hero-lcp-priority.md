# Hero LCP Priority Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve the homepage Lighthouse warning that its LCP image lacks `fetchpriority="high"`.

**Architecture:** Add the native priority hint directly to the existing server-rendered `NuxtImg` in `app/components/new-hero.vue`. Keep its existing source and layout. Discovery and non-lazy loading already pass in the supplied audit, so start with the smallest change and measure before adding preload or image transformations.

**Tech Stack:** Nuxt 4.6.2, Vue 3, TypeScript, @nuxt/image 1.11.x, pnpm.

---

### Task 1: Capture the baseline

**Files to inspect:**

- `app/pages/index.vue` (renders `new-hero`)
- `app/components/new-hero.vue:3` (LCP image)

1. Run the production build with `pnpm build`, then serve it with `pnpm preview`.
2. Run a mobile Lighthouse audit on `/`; record the LCP value, LCP element, image URL, and request-discovery findings. Use a cold cache and record the test settings.
3. Inspect the initial HTML and confirm the hero `<img>` is present without `fetchpriority="high"`. Record its network priority and request timing in DevTools.

### Task 2: Set the hero image priority

**Modify:** `app/components/new-hero.vue:3`

Replace the existing image tag with:

```vue
<NuxtImg
  class="image"
  src="caregiver-and-senior-woman-laughing-together.jpg"
  fetchpriority="high"
  loading="eager"
/>
```

The explicit eager hint preserves the audit's passing non-lazy behavior. Apply high priority only to this hero image. Preserve the approved hero CSS and visual layout described in `docs/style-system.md`.

Do not add a preload initially: the audit already confirms discovery in the initial document. If the new trace still shows a meaningful discovery delay, evaluate Nuxt Image's `:preload="{ fetchPriority: 'high' }"` separately, retaining the image's own `fetchpriority` attribute. Confirm the preload targets the exact resource the browser uses and introduces no duplicate download.

Reference: https://image.nuxt.com/usage/nuxt-img (native image attributes and preload configuration). Installed component source also supports the preload priority object.

### Task 3: Verify the rendered result and performance

1. Run `pnpm build` after the change. Document any build failure and whether it is related to this change.
2. Restart `pnpm preview` and inspect the raw homepage HTML. The hero `<img>` must contain `fetchpriority="high"` and `loading="eager"`, with a discoverable image URL before JavaScript runs.
3. Check mobile and desktop viewports: the image, crop, overlay, and action cards should render as before. Confirm the hero request has high priority and no duplicate image request was introduced.
4. Repeat Lighthouse with the same settings, using three cold-cache runs before and after when possible. Compare median LCP and confirm all three request-discovery checks pass. The warning should clear; do not promise a particular LCP improvement from the hint alone.
5. If LCP remains slow, use its timing breakdown to identify the next bottleneck. Consider responsive sizes or compression only if transfer size is the measured cause; investigate rendering work if render delay dominates.

**Acceptance criteria:** Production build passes; initial HTML includes the priority hint; the supplied warning clears; existing discovery and non-lazy checks remain passing; homepage appearance is unchanged.

**Validation scope:** Browser and production HTML checks are appropriate for this small attribute change. No new unit-test suite is needed.
