# Error Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a reusable Nuxt error screen that matches the Figma 404 layout and can support non-404 error variants.

**Architecture:** Add a presentational `ErrorScreen` component that owns the visual layout and accepts status, copy, and CTA props. Keep navigation and error recovery logic in `app/error.vue`, which maps Nuxt errors into the reusable screen and chooses the back-or-home behavior.

**Tech Stack:** Nuxt 3, Vue 3 `<script setup>`, TypeScript, scoped component CSS, existing SVG assets

---

### Task 1: Add reusable error screen component

**Files:**

- Create: `app/components/ErrorScreen.vue`

**Step 1: Define typed props and emits**

- Accept `statusCode`, `title`, `message`, `primaryLabel`, and optional `secondaryLabel`
- Emit `primary` and optional `secondary` actions

**Step 2: Build the Figma-based layout**

- Add branded header with rooster mark and wordmark text
- Add centered status code, title, support copy, CTA row, and footer band

**Step 3: Add scoped styling**

- Match the Figma page using the repo’s existing spacing, color, radius, and font tokens
- Keep CTA styles local so existing `.button` patterns are untouched

### Task 2: Wire Nuxt error handling

**Files:**

- Modify: `app/error.vue`

**Step 1: Map Nuxt error state into UI copy**

- Use `404` copy from the Figma design
- Use a generic title and message for other statuses

**Step 2: Implement CTA behavior**

- Prefer client-side back navigation when history exists
- Fall back to `clearError({ redirect: '/' })`

**Step 3: Connect actions to the reusable component**

- Render `ErrorScreen`
- Pass labels and bind the primary action

### Task 3: Verify

**Files:**

- Verify: `app/components/ErrorScreen.vue`
- Verify: `app/error.vue`

**Step 1: Run build**

Run: `pnpm build`

**Step 2: Review output**

- Confirm the build succeeds
- Call out anything not verified visually in-browser
