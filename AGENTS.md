# AGENTS.md

## Purpose
This file gives coding agents and contributors the minimum project context needed to work safely and efficiently in this repository.

## Project Snapshot
- Framework: Nuxt 3 + TypeScript
- Package manager: `pnpm`
- App code: `app/`
- Server/API code: `server/`
- Shared types/utils: `shared/`
- Static assets: `public/`

## Local Setup
1. Install dependencies:
   - `pnpm install`
2. Start development server:
   - `pnpm dev`
3. Build for production:
   - `pnpm build`
4. Preview production build:
   - `pnpm preview`

## Working Agreements
- Keep changes focused and minimal.
- Prefer TypeScript-safe updates over quick runtime-only fixes.
- Preserve existing file structure and naming patterns.
- Do not commit secrets; treat `.env` as local-only configuration.
- When changing API behavior, update both client usage and server handlers where needed.

## Code Map
- `app/pages/`: route pages
- `app/components/`: reusable UI components
- `app/composables/`: shared frontend logic hooks
- `server/api/`: server endpoints
- `server/route/`: server route handlers
- `shared/types/`: shared type definitions
- `shared/utils/`: shared utilities

## Validation Before Handoff
- Run relevant checks for changed areas (at minimum `pnpm build` when feasible).
- Sanity-check key flows impacted by your edits.
- Call out anything you could not verify locally.

## Notes for Future Agents
- Start by reading `README.md` for project-specific context.
- If requirements are unclear, choose the simplest implementation that matches current patterns.

## TODO Backlog (Stripe + Registration)
- [ ] Process only successful payment webhooks for registration creation; do not create registrations on `checkout.session.async_payment_failed`.
- [ ] Add webhook idempotency (store processed Stripe `event.id` or checkout session ID) to prevent duplicate registrations on retries.
- [ ] Lock down `/api/stripe/success` so `session_id` cannot expose another customer’s checkout details; return only minimal UI-safe fields.
- [ ] Escape/sanitize Airtable `filterByFormula` inputs (especially email) and normalize email before lookup to reduce injection/brittle query risks.
- [ ] Enforce server-side seat availability checks at payment completion time to prevent overbooking/race-condition registrations.
