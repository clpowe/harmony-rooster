# Error Screen Design

**Date:** 2026-03-28

**Goal:** Implement the Figma 404 page as a reusable application error screen that can support other error states later.

## Decisions

- Build a dedicated `ErrorScreen` component instead of hard-coding the design in `app/error.vue`.
- Use the Figma 404 composition as the default visual shell: branded header, oversized status code, title line, muted supporting copy, rounded CTA, and footer band.
- Keep Nuxt-specific behavior in `app/error.vue` so the presentational component stays reusable.
- Make the primary action prefer browser back navigation and fall back to clearing the error and redirecting home.
- Allow future variants by parameterizing status code, title, message, and action labels.

## Scope

- Create `app/components/ErrorScreen.vue`
- Replace the placeholder implementation in `app/error.vue`
- Reuse existing project assets and tokens instead of introducing a new dependency or icon package
- Verify with `pnpm build`

## Non-Goals

- Building a global status-page framework
- Reworking the site-wide default header or footer
- Adding dedicated content variants for every backend error in this pass
