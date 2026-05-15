# Contact Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a secure Nuxt contact form with shared validation, Resend delivery, and first-pass spam prevention.

**Architecture:** Reuse a shared Zod schema for both Vee-Validate on the client and request validation on the server. Keep the Resend key server-only behind a POST API route that also enforces origin checks, honeypot rejection, minimum submit time, and IP rate limiting.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Zod, Vee-Validate, Nitro server routes, Resend

---

### Task 1: Shared Contact Schema

**Files:**

- Create: `shared/types/contact.ts`

**Step 1: Add the shared schema and types**

- Define `contactFormSchema`
- Export input/output types
- Include normalization helpers for trimmed strings and lowercase email

**Step 2: Include spam-control fields**

- Add `company` honeypot
- Add `startedAt` timestamp
- Keep the schema usable by both client and server

### Task 2: Secure Contact API Route

**Files:**

- Create: `server/api/contact.post.ts`
- Modify: `nuxt.config.ts`

**Step 1: Add runtime config for contact delivery**

- Add `contactFromEmail`
- Add `contactToEmail`

**Step 2: Implement the POST handler**

- Read body
- Validate against shared schema
- Check honeypot
- Check minimum submit delay
- Check request origin when present
- Rate-limit by client IP using Nitro storage

**Step 3: Send email through Resend**

- Initialize Resend from server runtime config
- Send plain-text email
- Return minimal success payload
- Throw safe server errors on failure

### Task 3: Contact Form UI

**Files:**

- Modify: `app/components/ContactForm.vue`
- Modify: `app/assets/css/main.css` only if a shared utility or token is needed

**Step 1: Build the form with Vee-Validate**

- Use the shared Zod schema through `toTypedSchema`
- Add fields for `name`, `email`, `message`, `company`, and `startedAt`
- Post to `/api/contact`

**Step 2: Match the existing site styling**

- Use existing color, spacing, and radius tokens
- Match the Figma layout and inline error presentation
- Keep mobile behavior reasonable within the current home page layout

**Step 3: Add submit state and feedback**

- Disable submit while pending
- Show success and failure messages
- Reset the visible fields on successful submission

### Task 4: Cleanup and Verification

**Files:**

- Modify: `server/api/send.ts` if needed for deprecation or removal

**Step 1: Remove or neutralize the demo send route if it is now redundant**

- Avoid leaving a misleading mail endpoint in place

**Step 2: Run project verification**

Run: `pnpm test`
Expected: existing tests plus any touched server behavior still pass

Run: `pnpm build`
Expected: production build succeeds

**Step 3: Document required environment variables in the handoff**

- `NUXT_RESEND_API_KEY` or matching runtime config source
- `NUXT_CONTACT_FROM_EMAIL`
- `NUXT_CONTACT_TO_EMAIL`
- `NUXT_PUBLIC_SITE_URL`
