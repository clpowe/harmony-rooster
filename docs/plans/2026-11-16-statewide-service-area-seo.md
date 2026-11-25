# Statewide service area SEO plan

Written November 16, 2026, from a read-only review of the `preview` branch
(including uncommitted edits). The live site was not reachable during the review,
so findings describe the code, not the current deployment. No application code
was changed.

## Background

The site presents Harmony Roosters as a Riverview/Brandon provider. The actual
service area supplied by the business is all 67 Florida counties, so the real
service area is statewide.

Notes on the supplied list:

- "LAYFAYETTE" is a misspelled duplicate of Lafayette; 68 entries reduce to 67.
- "SAINT JOHNS" and "SAINT LUCIE" should be published as "St. Johns" and "St. Lucie".
- The order of the list matches six groups that appear to be APD's regions. The
  region names below are inferred and must be confirmed against APD before they
  are published or used in URLs.

| Region (to confirm) | Counties                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Suncoast (11)       | Charlotte, Collier, DeSoto, Glades, Hendry, Hillsborough, Lee, Manatee, Pasco, Pinellas, Sarasota                                                                           |
| Central (12)        | Brevard, Citrus, Hardee, Hernando, Highlands, Lake, Marion, Orange, Osceola, Polk, Seminole, Sumter                                                                         |
| Northeast (20)      | Alachua, Baker, Bradford, Clay, Columbia, Dixie, Duval, Flagler, Gilchrist, Hamilton, Lafayette, Levy, Madison, Nassau, Putnam, St. Johns, Suwannee, Taylor, Union, Volusia |
| Northwest (16)      | Bay, Calhoun, Escambia, Franklin, Gadsden, Gulf, Holmes, Jackson, Jefferson, Leon, Liberty, Okaloosa, Santa Rosa, Wakulla, Walton, Washington                               |
| Southeast (6)       | Broward, Indian River, Martin, Okeechobee, Palm Beach, St. Lucie                                                                                                            |
| Southern (2)        | Miami-Dade, Monroe                                                                                                                                                          |

## Current implementation

Every location signal says Riverview/Brandon, and each is typed by hand.

| Signal                     | File                                  | Current value                                                                          |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| Title and meta description | `app/pages/index.vue`                 | "…in Riverview/Brandon, FL", "…Hillsborough County, Florida"                           |
| H1                         | `app/components/new-hero.vue`         | "Home care for adults with disabilities in Riverview & Brandon, FL"                    |
| LocalBusiness schema       | `app/app.vue`                         | `areaServed`: Riverview, Brandon, Hillsborough County; description names the same area |
| Services intro             | `app/components/our-services.vue`     | "Riverview/Brandon area"                                                               |
| FAQ, questions 1 and 10    | `app/components/FAQSection.vue`       | "We serve the Riverview/Brandon area of Hillsborough County"                           |
| Footer                     | `app/components/page-footer.vue`      | "serving Riverview, Brandon and the Tampa Bay area"; "Riverview/Brandon, FL"           |
| Trust badge                | `app/components/App-Trust.vue`        | "Family-owned in Tampa Bay"                                                            |
| Courses meta description   | `app/pages/courses.vue`               | "courses in Riverview and Brandon, FL"                                                 |
| Privacy page               | `app/pages/privacy-accessibility.vue` | "Riverview/Brandon, Florida"                                                           |
| Unused hero                | `app/components/home-hero.vue`        | "…in Riverview/Brandon" (component is not referenced)                                  |

Structural limits:

- **No single source of truth.** The area is repeated across nine files.
- **No pages to rank with.** The indexable content pages are `/`, `/courses` and
  `/privacy-accessibility`. All four services are homepage anchors, and the footer
  service links all point to `/#our-services`.
- **Schema is thin and duplicated.** `app.vue` declares an `organizationSchema`
  object that is never used, then repeats the same data inside `useSchemaOrg`.
  There is no telephone, and the FAQ has no structured data.

Still open from `docs/seo-audit-2026-11-01.md` in the local config:

- `sitemap.exclude` covers only `/design-system`; `/cancel` and `/course/register`
  are not excluded.
- No noindex for preview deployments was found.

## Phase 0: decisions

These shape the copy and the page structure, so settle them first.

1. Which services are statewide? In-home services can travel. The foster home is a
   physical home and courses happen at a venue, so those stay tied to a location.
2. Where can staff realistically take new consumers now? Copy that promises all 67
   counties will generate inquiries from all of them.
3. How to describe the home base. Suggested: "Based in Riverview, serving all of
   Florida", which keeps the existing local relevance.
4. Confirm the APD region names and county assignments above.

## Phase 1: one source of truth

1. Add `shared/constants/service-area.ts` exporting the 67 counties, each with a
   display name, slug and region, plus the region list and the home base.
2. Add a small unit test: 67 unique counties, every county has a region.
3. Derive schema, the FAQ answer, the footer line and new pages from this file.

## Phase 2: correct the existing signals

1. `app/pages/index.vue`: reword title and description to lead with the service
   and Florida, keeping Riverview as the home base. Keep the title short enough
   that the brand suffix is not truncated.
2. `app/components/new-hero.vue`: reword the H1 to match.
3. `app/components/FAQSection.vue`: rewrite question 10 from the data file and
   link to the service area page; adjust question 1.
4. `app/components/our-services.vue`, `page-footer.vue`, `App-Trust.vue`,
   `privacy-accessibility.vue`: update area wording. "Family-owned in Tampa Bay"
   can stay as a statement of where the business is based.
5. `app/pages/courses.vue`: keep the venue city, since courses are in person, and
   fix the title so the brand appears once.
6. `app/app.vue`: delete the unused `organizationSchema` object. Set `areaServed`
   to the State of Florida plus the counties from the data file. Add
   `telephone: "+18134340447"`. Update the description.
7. Give the foster home service its own Riverview/Hillsborough `areaServed`
   instead of the statewide one.
8. Delete or update the unused `home-hero.vue`.

## Phase 3: pages that can rank outside Hillsborough

1. `/service-area`: all counties grouped by region, how service starts in each
   region, and a contact path. Link it from the footer and the FAQ.
2. One page per service (personal supports, respite, nursing, foster home), each
   stating where it is available, who it supports, funding, and how to start.
   Point the footer service links at these pages.
3. Six region pages, built before any county pages. Each needs real regional
   content: the APD regional office, how support coordinators refer, and current
   availability there.
4. Do not generate 67 county pages from a template. Pages that differ only by
   place name are the doorway pattern the November 1 audit warned against. Add a
   county page only when there is something specific to say about that county.
5. Add the new routes to the sitemap and prerender list. In the same pass,
   exclude `/cancel` and `/course/register` and add preview noindex.
6. Add FAQ structured data if the FAQ stays on the homepage.

## Phase 4: off-site and measurement

1. Update the Google Business Profile service area. It is understood to cap at 20
   areas (verify in the profile editor), so "Florida" or the regions will fit
   where 67 counties will not.
2. Update the APD provider directory and other listings to match the site.
3. Track Search Console impressions and clicks by region and service page.
4. Add a county field to the contact form so PostHog shows where inquiries
   originate.

## Verification

- `pnpm lint`, `pnpm test` and `pnpm build` pass.
- Search the repo for "Riverview" and "Brandon"; every remaining mention is a
  deliberate home-base, foster home or venue reference.
- Rendered schema validates and lists Florida plus 67 counties.
- `sitemap.xml` on production lists the new pages and omits utility pages.
- Preview deployments return noindex.

## Out of scope

Rankings, backlinks, real-user performance and the live deployment were not
evaluated. Keyword demand by county was not researched.
