<script setup lang="ts">
import type { Session, Course } from "@types/courses";
import { getReceiptStatus } from "@utils/receipt-status";
import ReceiptHeader from "@/components/receipt/ReceiptHeader.vue";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Design system | Harmony Roosters",
  description: "Harmony Roosters design tokens, component specimens, states, and page patterns.",
  robots: "noindex, nofollow",
});

const primaryColors = [
  {
    name: "Primary 100",
    token: "--clr-primary-100",
    use: "Date chips, selected sessions, focus halo",
  },
  {
    name: "Primary 300",
    token: "--clr-primary-300",
    use: "Highlights and flourishes on dark surfaces",
  },
  { name: "Primary 400", token: "--clr-primary-400", use: "Interactive highlights" },
  {
    name: "Primary 500",
    token: "--clr-primary-500",
    use: "Primary actions, links, icons, Apply band",
  },
  { name: "Primary 600", token: "--clr-primary-600", use: "Text-link hover and pressed actions" },
];
const supportingColors = [
  { name: "Button accent", token: "--clr-accent-300", use: "Phone and support actions" },
  { name: "Accent ink", token: "--clr-accent-900", use: "Text on amber buttons" },
  { name: "Accent 500", token: "--clr-accent-500", use: "Step numerals, receipt rule" },
  { name: "Accent 600", token: "--clr-accent-600", use: "Eyebrows and warning text" },
  { name: "Text", token: "--clr-text", use: "Headings, values, navigation" },
  { name: "Muted text", token: "--clr-text-muted", use: "Body, labels, metadata" },
  { name: "Surface", token: "--clr-surface", use: "Panels and cards" },
  { name: "Page surface", token: "--clr-surface-page", use: "Page background and nested cards" },
  { name: "Border", token: "--clr-border", use: "Inputs, dividers, rules" },
  { name: "Success", token: "--clr-success-500", use: "Confirmed outcomes" },
  { name: "Danger", token: "--clr-danger-500", use: "Invalid fields and errors" },
];
const typeSpecimens = [
  {
    label: "Display XL · Hero",
    sample: "Care you can trust",
    token: "--text-display-xl",
    leading: "0.94",
    details: "48–112px · 400 · −0.045em",
    tracking: "var(--tracking-display)",
  },
  {
    label: "Display L · Page title, Apply band",
    sample: "Provider Training",
    token: "--text-display-lg",
    leading: "0.98",
    details: "44–96px · 400 · −0.045em",
    tracking: "var(--tracking-display)",
  },
  {
    label: "H2 · Section title",
    sample: "Our Services",
    token: "--text-heading-1",
    leading: "1",
    details: "44–84px · 400 · −0.04em",
    tracking: "-0.04em",
  },
  {
    label: "Display M · Receipt status",
    sample: "You’re registered",
    token: "--text-display-md",
    leading: "0.98",
    details: "40–72px · 400 · −0.045em",
    tracking: "var(--tracking-display)",
  },
  {
    label: "H3 · Subsection, form title",
    sample: "About this course",
    token: "--text-heading-2",
    leading: "1.05",
    details: "30–42px · 400 · −0.03em",
    tracking: "var(--tracking-heading)",
  },
  {
    label: "H4 · Card title",
    sample: "Medication Administration Provider Training",
    token: "--text-heading-3",
    leading: "1.1",
    details: "24–32px · 400 · −0.03em",
    tracking: "var(--tracking-heading)",
  },
  {
    label: "H5 · Small heading",
    weight: 500,
    sample: "Upcoming sessions",
    token: "--text-heading-4",
    leading: "1.2",
    details: "20–24px · 500",
  },
  {
    label: "Lede",
    sample: "We offer compassionate, non-emergency in-home care services.",
    token: "--text-lede",
    leading: "1.55",
    details: "18–22px · 400 · italic",
    italic: true,
  },
  {
    label: "Body L · Section intro",
    sample: "Medication Administration Provider Training for direct-care professionals.",
    token: "--text-body-lg",
    leading: "1.6",
    details: "17–20px · 400",
  },
  {
    label: "Body · Cards, buttons, values",
    sample: "Short-term relief care to give primary caregivers a break.",
    token: "--text-body",
    leading: "1.55",
    details: "17px · 400",
  },
  {
    label: "Small · Helper, form label",
    sample: "Secure payment by Stripe. You’ll get a receipt by email.",
    token: "--text-small",
    leading: "1.5",
    details: "15px · 400 / 500",
  },
  {
    label: "Caption · Detail-row label",
    sample: "Location",
    token: "--text-caption",
    leading: "1.4",
    details: "14px · 400",
  },
];
const spacing = [
  { token: "--space-100", label: "4", use: "Tight label/value stacks" },
  { token: "--space-200", label: "8", use: "Icon-to-label and field-label gaps" },
  { token: "--space-300", label: "12", use: "Button groups and detail-row icons" },
  { token: "--space-400", label: "16", use: "Heading-to-paragraph and field gaps" },
  { token: "--space-450", label: "20", use: "Card grid gap and form stack" },
  { token: "--space-500", label: "24", use: "Card padding and inner stacks" },
  { token: "--space-panel", label: "32–56", use: "Panel padding and header-to-content" },
  { token: "--space-layout", label: "32–96", use: "Two-column panel gap" },
  { token: "--space-section", label: "64–128", use: "Between page sections" },
];
const shapes = [
  { token: "--radius-input", label: "14", use: "Input" },
  { token: "--radius-nested", label: "16", use: "Nested image and banner" },
  { token: "--radius-inner", label: "24", use: "Inner card and session tile" },
  { token: "--radius-card", label: "28", use: "Course and step card" },
  { token: "--radius-panel", label: "20–32", use: "Section panel" },
  { token: "--radius-pill", label: "999", use: "Buttons, chips, icon discs" },
];
const sessions: Session[] = [
  {
    id: "specimen-open",
    session_name: "November session",
    date: "2026-11-13",
    time: "8:30 AM – 2:30 PM",
    capacity: 20,
    spots_available: 12,
    location: "St. Mary Baptist Church",
  },
  {
    id: "specimen-limited",
    session_name: "November session",
    date: "2026-11-24",
    time: "8:30 AM – 2:30 PM",
    capacity: 20,
    spots_available: 3,
    location: "St. Mary Baptist Church",
  },
  {
    id: "specimen-full",
    session_name: "December session",
    date: "2026-12-05",
    time: "8:30 AM – 2:30 PM",
    capacity: 20,
    spots_available: 0,
    location: "St. Mary Baptist Church",
  },
  {
    id: "specimen-january",
    session_name: "January session",
    date: "2027-01-16",
    time: "8:30 AM – 2:30 PM",
    capacity: 20,
    spots_available: 6,
    location: "St. Mary Baptist Church",
  },
];
const sampleCourse: Course = {
  id: "specimen-course",
  course_name: "Medication Administration Provider Training",
  description: "Medication Administration Provider training for direct-care professionals.",
  duration: 0,
  cost: 95,
  sessions: sessions.slice(0, 2),
};
const openSession = sessions[0]!;
const fullSession = sessions[2]!;
const selectedSession = ref(openSession.id);
const solidSession = ref(sessions[1]!.id);
const courseFilter = ref("");
const monthFilter = ref("");
const courseOptions = [
  { value: "", label: "All courses" },
  { value: "medication", label: "Medication Administration" },
  { value: "first-aid", label: "CPR & First Aid" },
];
const monthOptions = [
  { value: "", label: "All dates" },
  { value: "2026-11", label: "Nov" },
  { value: "2026-12", label: "Dec" },
];
const defaultName = ref("");
const email = ref("jordan@");
const filledEmail = ref("jordan@example.com");
const message = ref("");
const emailError = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
    ? undefined
    : "Enter an email like name@example.com.",
);
const focusField = ref<{ focus: () => void }>();
const copied = ref(false);
const copyError = ref("");
const registrationStep = ref<1 | 2 | 3>(1);
const previewNotice = ref("");

async function copySampleLink() {
  copied.value = false;
  copyError.value = "";
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
  } catch {
    copyError.value = "Clipboard unavailable. You can copy this page’s address from your browser.";
  }
}
function preventDemoNavigation(event: MouseEvent) {
  if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
}
</script>

<template>
  <main class="design-system" @click.capture="preventDemoNavigation">
    <header class="ds-sheet ds-cover flow">
      <p class="ds-eyebrow">Design system · V1</p>
      <h1>Harmony Roosters<br /><span>UI system</span></h1>
      <p class="ds-intro">
        Tokens and components collected from the Home, Course and Receipt pages.
      </p>
      <p class="ds-note">Live specimens · Sample content · Interactive component states</p>
    </header>

    <section id="ds-color" class="ds-sheet flow" aria-labelledby="ds-color-title">
      <header class="ds-section-heading flow">
        <p class="ds-eyebrow">01</p>
        <h2 id="ds-color-title">Color</h2>
        <p>
          Teal carries actions and highlights. Amber is the single warm accent. Neutrals carry text,
          dividers and surfaces.
        </p>
      </header>
      <h3 class="ds-heading">Primary</h3>
      <div class="ds-table-scroll" tabindex="0" role="region" aria-label="Primary color tokens">
        <table class="ds-table">
          <thead>
            <tr>
              <th scope="col"><span class="visually-hidden">Swatch</span></th>
              <th scope="col">Name</th>
              <th scope="col">Token</th>
              <th scope="col">Used for</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="color in primaryColors" :key="color.token">
              <td>
                <span class="ds-swatch" :style="{ backgroundColor: `var(${color.token})` }" />
              </td>
              <th scope="row">{{ color.name }}</th>
              <td>
                <code>{{ color.token }}</code>
              </td>
              <td>{{ color.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="ds-heading">Accent, text &amp; surface</h3>
      <div class="ds-table-scroll" tabindex="0" role="region" aria-label="Supporting color tokens">
        <table class="ds-table">
          <thead>
            <tr>
              <th scope="col"><span class="visually-hidden">Swatch</span></th>
              <th scope="col">Name</th>
              <th scope="col">Token</th>
              <th scope="col">Used for</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="color in supportingColors" :key="color.token">
              <td>
                <span class="ds-swatch" :style="{ backgroundColor: `var(${color.token})` }" />
              </td>
              <th scope="row">{{ color.name }}</th>
              <td>
                <code>{{ color.token }}</code>
              </td>
              <td>{{ color.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="ds-heading">Status</h3>
      <div class="cluster">
        <AppStatusPill label="Payment confirmed" tone="success" /><AppStatusPill
          label="Confirming payment"
          tone="pending"
          busy
        /><AppStatusPill label="Status unavailable" tone="warning" /><AppTag variant="full"
          >FULL</AppTag
        >
      </div>
    </section>

    <section id="ds-type" class="ds-sheet flow" aria-labelledby="ds-type-title">
      <header class="ds-section-heading flow">
        <p class="ds-eyebrow">02</p>
        <h2 id="ds-type-title">Type scale</h2>
        <p>
          Geist for everything, Geist Mono for eyebrows, dates and order numbers. Headings use
          regular weight and tight tracking. Sizes are fluid.
        </p>
      </header>
      <div class="ds-fonts auto-grid">
        <div>
          <p class="ds-font-example">Aa</p>
          <h3 class="ds-heading">Geist</h3>
          <p>400 · 500 · 600 — headings, body, UI</p>
        </div>
        <div class="ds-mono">
          <p class="ds-font-example">Aa</p>
          <h3 class="ds-heading">Geist Mono</h3>
          <p>400 — eyebrows, dates, receipt IDs, step counters</p>
        </div>
      </div>
      <div v-for="specimen in typeSpecimens" :key="specimen.token" class="ds-type-row">
        <p
          class="ds-type-sample"
          :class="{ 'ds-type-sample--italic': specimen.italic }"
          :style="{
            '--specimen-size': `var(${specimen.token})`,
            '--specimen-leading': specimen.leading,
            '--specimen-tracking': specimen.tracking ?? 'normal',
            '--specimen-weight': specimen.weight ?? 400,
          }"
        >
          {{ specimen.sample }}
        </p>
        <div class="ds-type-meta">
          <span>{{ specimen.label }}</span
          ><code>{{ specimen.token }}<br />{{ specimen.details }}</code>
        </div>
      </div>
      <div class="ds-type-row">
        <p class="ds-mono ds-eyebrow">Caregiver training · Florida Rule 65G-7</p>
        <div class="ds-type-meta">
          <span>Eyebrow / mono label</span><code>16px · uppercase · +0.04em</code>
        </div>
      </div>
      <div class="cluster ds-numerals"><span>1</span><span>16</span><span>$95</span></div>
      <div class="ds-specimen flow">
        <h3 class="ds-heading">Typography component</h3>
        <Typography tag="p" variant="heading-medium">Care you can <span>trust</span></Typography
        ><Typography tag="p" variant="body-medium"
          >Body text follows the shared type scale.</Typography
        ><Typography tag="p" variant="body-small">Small text and helper copy.</Typography>
      </div>
    </section>

    <section id="ds-spacing" class="ds-sheet flow" aria-labelledby="ds-spacing-title">
      <header class="ds-section-heading flow">
        <p class="ds-eyebrow">03</p>
        <h2 id="ds-spacing-title">Spacing, radii &amp; elevation</h2>
        <p>
          A 4px base. Small steps space content inside components; large steps are fluid and space
          sections.
        </p>
      </header>
      <div class="ds-table-scroll" tabindex="0" role="region" aria-label="Spacing scale">
        <table class="ds-table">
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Scale</th>
              <th scope="col">Used for</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="space in spacing" :key="space.token">
              <td><span class="ds-space-bar" :style="{ inlineSize: `var(${space.token})` }" /></td>
              <th scope="row">{{ space.label }}</th>
              <td>
                {{ space.use }}<br /><code>{{ space.token }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="ds-heading">Layout</h3>
      <div class="ds-layout-values auto-grid">
        <p><code>min(100% − 2.5rem, 90rem)</code><br />Page container</p>
        <p><code>46rem</code><br />Narrow column · receipt</p>
      </div>
      <h3 class="ds-heading">Radii</h3>
      <div class="ds-shapes auto-grid">
        <div v-for="shape in shapes" :key="shape.token">
          <div class="ds-shape" :style="{ borderRadius: `var(${shape.token})` }">
            {{ shape.label }}
          </div>
          <p>{{ shape.use }}</p>
          <code>{{ shape.token }}</code>
        </div>
      </div>
      <h3 class="ds-heading">Elevation</h3>
      <div class="ds-elevations auto-grid">
        <div class="ds-elevation">
          <p>None</p>
          <p class="ds-note">Panels and cards</p>
        </div>
        <div class="ds-elevation ds-elevation--one">
          <code>--shadow-100</code>
          <p class="ds-note">Subtle lift</p>
        </div>
        <div class="ds-elevation ds-elevation--two">
          <code>--shadow-200</code>
          <p class="ds-note">Summary, receipt</p>
        </div>
      </div>
    </section>

    <section id="ds-components" class="ds-sheet flow" aria-labelledby="ds-components-title">
      <header class="ds-section-heading flow">
        <p class="ds-eyebrow">04</p>
        <h2 id="ds-components-title">Components</h2>
        <p>
          Hover, press, or use the Tab key to inspect the shared interaction states. Each specimen
          uses the actual Vue component.
        </p>
      </header>
      <section class="ds-specimen flow" aria-labelledby="ds-buttons">
        <h3 id="ds-buttons" class="ds-heading">Button</h3>
        <p>Pill actions: primary, accent, outline and ghost chip.</p>
        <p class="ds-pages">Home · Course · Receipt</p>
        <div class="cluster">
          <AppButton @click="previewNotice = 'Primary action selected.'">Apply now</AppButton
          ><AppButton variant="accent"
            ><template #icon-start><AppIcon name="lucide:phone" /></template>813-434-0447</AppButton
          ><AppButton variant="secondary"
            >All courses<template #icon-end
              ><AppIcon name="lucide:arrow-right" /></template></AppButton
          ><AppButton variant="ghost"
            ><template #icon-start><AppIcon name="lucide:arrow-left" /></template>Return
            home</AppButton
          >
        </div>
        <p v-if="previewNotice" role="status" class="ds-note">{{ previewNotice }}</p>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-arrows">
        <h3 id="ds-arrows" class="ds-heading">Arrow button</h3>
        <p>Primary CTA with a 48px icon disc. Full-width in cards, inverted on teal.</p>
        <p class="ds-pages">Home · Course</p>
        <AppArrowButton full-width>Register for Fri, Nov 13</AppArrowButton
        ><AppPanel as="div" tone="primary"
          ><AppArrowButton variant="inverse">Apply now</AppArrowButton></AppPanel
        >
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-links">
        <h3 id="ds-links" class="ds-heading">Text link &amp; icon button</h3>
        <p>Arrow link with amber underline on hover. A 48px round button for scrolling controls.</p>
        <div class="cluster">
          <AppTextLink href="#ds-components">Learn more</AppTextLink
          ><AppTextLink href="#ds-components" icon="lucide:arrow-up-right"
            >Get directions</AppTextLink
          ><AppIconButton label="Previous example" icon="lucide:arrow-left" /><AppIconButton
            label="Next example"
            icon="lucide:arrow-right"
          /><AppIconButton label="Unavailable example" icon="lucide:arrow-right" disabled />
        </div>
        <div class="cluster">
          <AppIcon name="lucide:calendar-days" label="Calendar" /><AppIcon
            name="lucide:map-pin"
            label="Location"
          /><AppIcon name="lucide:shield-check" label="Verified" />
        </div>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-tags">
        <h3 id="ds-tags" class="ds-heading">Pills &amp; tags</h3>
        <p>Date chip, seats chip, FULL tag, and receipt status pills.</p>
        <p class="ds-pages">Home · Course · Receipt</p>
        <div class="cluster">
          <AppTag datetime="2026-11-13" icon="lucide:calendar-days">Fri, Nov 13</AppTag
          ><AppTag variant="seats">6 seats left</AppTag><AppTag variant="full">FULL</AppTag>
        </div>
        <div class="cluster">
          <AppStatusPill label="Payment confirmed" tone="success" /><AppStatusPill
            label="Confirming payment"
            tone="pending"
            busy
          /><AppStatusPill label="Status unavailable" tone="warning" /><AppStatusPill
            label="No payment required"
            tone="neutral"
          />
        </div>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-fields">
        <h3 id="ds-fields" class="ds-heading">Text field</h3>
        <p>
          56px tall, 14px radius. Focus uses a teal border and 3px halo. Error text is associated
          with its field.
        </p>
        <p class="ds-pages">Course · Contact</p>
        <div class="ds-fields auto-grid">
          <AppTextField
            id="ds-first-name"
            v-model="defaultName"
            label="First name"
            autocomplete="given-name"
            placeholder="Name"
          /><AppTextField
            id="ds-email"
            ref="focusField"
            v-model="email"
            label="Email"
            type="email"
            :error="emailError"
          />
        </div>
        <AppTextField
          id="ds-message"
          v-model="message"
          as="textarea"
          label="Message"
          hint="A multiline field using the same control system."
          :rows="3"
        /><AppButton variant="ghost" size="small" @click="focusField?.focus()"
          >Focus email example</AppButton
        >
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-details">
        <h3 id="ds-details" class="ds-heading">Detail row &amp; summary row</h3>
        <p>Icon disc with label/value for class facts; two-column rows for order data.</p>
        <p class="ds-pages">Course · Receipt</p>
        <dl>
          <AppDetailRow
            icon="lucide:map-pin"
            label="Location"
            value="St. Mary Baptist Church"
            href="#ds-details"
            link-label="Directions"
          /><AppSummaryRow label="Order number" value="…WD4Wjdlx" mono /><AppSummaryRow
            label="Total"
            value="$95.00"
          />
        </dl>
        <CourseRegistrationDetail
          icon="lucide:clock-4"
          label="Compact course detail"
          value="8:30 AM – 2:30 PM"
        />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-sessions">
        <h3 id="ds-sessions" class="ds-heading">Session tile</h3>
        <p>
          Native radio tiles in a horizontal snap strip. Selected sessions use a tint or solid teal;
          FULL dates are struck and disabled.
        </p>
        <p class="ds-pages">Course</p>
        <CourseSessionSelector
          v-model="selectedSession"
          :sessions="sessions"
          legend="Selected · Tint"
        /><CourseSessionSelector
          v-model="solidSession"
          :sessions="sessions"
          selected-variant="solid"
          legend="Selected · Solid"
        />
        <p class="ds-note" role="status">Selected example: {{ selectedSession }}</p>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-session-rows">
        <h3 id="ds-session-rows" class="ds-heading">Session row &amp; seat meter</h3>
        <p>Open, few-seats and full states use the same normalized availability.</p>
        <CourseSessionRow
          v-for="session in sessions.slice(0, 3)"
          :key="session.id"
          :session="session"
          course-id="specimen-course"
          :course-name="sampleCourse.course_name"
        /><AppSeatMeter :available="6" :capacity="20" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-course-card">
        <h3 id="ds-course-card" class="ds-heading">Course card</h3>
        <p>28px radius, date chip, price, seat meter and 4px primary outline on hover.</p>
        <p class="ds-pages">Home</p>
        <div class="ds-card-grid auto-grid">
          <CourseCard
            :session="openSession"
            :course-id="sampleCourse.id"
            :course-name="sampleCourse.course_name"
            :course-price="95"
          /><CourseCard
            :session="fullSession"
            :course-id="sampleCourse.id"
            :course-name="sampleCourse.course_name"
            :course-price="95"
          />
        </div>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-steps">
        <h3 id="ds-steps" class="ds-heading">Step card &amp; trust badge</h3>
        <p>Amber numerals for processes; icon-disc badges for credentials.</p>
        <p class="ds-pages">Home</p>
        <ol class="ds-step-list auto-grid u-list-reset" role="list">
          <AppStepCard :step="1" title="Apply"
            >Fill out an application online, or call with questions about getting
            started.</AppStepCard
          ><AppStepCard :step="2" title="Talk with us"
            >Tell us about the support you’re looking for.</AppStepCard
          ><AppStepCard :step="3" title="Explore next steps"
            >Discuss availability with our team.</AppStepCard
          >
        </ol>
        <AppTrustBadge icon="lucide:shield-check">State-licensed provider</AppTrustBadge
        ><AppTrust />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-accordion">
        <h3 id="ds-accordion" class="ds-heading">Accordion row</h3>
        <p>Hairline-divided questions with a 52px toggle disc; filled teal when open.</p>
        <p class="ds-pages">Home</p>
        <AppAccordion question="How much does care cost?" open
          ><p>
            Services depend on each consumer’s approved APD iBudget Waiver allocation. Contact our
            team to discuss your needs.
          </p></AppAccordion
        ><AppAccordion question="Who can benefit from your services?"
          ><p>
            Our services support individuals with developmental disabilities who need help with
            daily living.
          </p></AppAccordion
        >
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-receipt">
        <h3 id="ds-receipt" class="ds-heading">Receipt header</h3>
        <p>3:1 teal/amber top rule, status pill and mono receipt ID.</p>
        <p class="ds-pages">Receipt</p>
        <div class="ds-receipt">
          <ReceiptHeader
            title="You’re registered"
            receipt-id="…WD4Wjdlx"
            :status="getReceiptStatus('confirmed', 'paid')"
            title-id="ds-receipt-sample-title"
            heading-tag="h3"
          />
        </div>
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-wordmark">
        <h3 id="ds-wordmark" class="ds-heading">Wordmark</h3>
        <p>Two-line brand wordmark, teal over amber.</p>
        <p class="ds-pages">All pages</p>
        <SiteBrand />
      </section>
    </section>

    <section id="ds-states" class="ds-sheet flow" aria-labelledby="ds-states-title">
      <header class="ds-section-heading flow">
        <h2 id="ds-states-title">States</h2>
        <p>
          Live controls show hover, pressed and focus states through normal interaction. Disabled
          and loading examples are rendered explicitly.
        </p>
      </header>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Primary button</h3>
        <div class="ds-state-grid">
          <figure>
            <AppButton>Apply now</AppButton>
            <figcaption>Default · hover · press · focus</figcaption>
          </figure>
          <figure>
            <AppButton disabled>Apply now</AppButton>
            <figcaption>Disabled</figcaption>
          </figure>
          <figure>
            <AppButton loading>Checking…</AppButton>
            <figcaption>Loading</figcaption>
          </figure>
        </div>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Accent button</h3>
        <div class="ds-state-grid">
          <figure>
            <AppButton variant="accent">813-434-0447</AppButton>
            <figcaption>Default · hover · press · focus</figcaption>
          </figure>
          <figure>
            <AppButton variant="accent" disabled>813-434-0447</AppButton>
            <figcaption>Disabled</figcaption>
          </figure>
        </div>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Outline button &amp; ghost chip</h3>
        <div class="ds-state-grid">
          <figure>
            <AppButton variant="secondary">All courses</AppButton>
            <figcaption>Default · hover · press · focus</figcaption>
          </figure>
          <figure>
            <AppButton variant="secondary" disabled>All courses</AppButton>
            <figcaption>Disabled</figcaption>
          </figure>
          <figure>
            <AppButton
              variant="ghost"
              :data-state="copied ? 'copied' : undefined"
              @click="copySampleLink"
              ><template #icon-start
                ><AppIcon :name="copied ? 'lucide:check' : 'lucide:copy'" /></template
              >{{ copied ? "Link copied" : "Copy page link" }}</AppButton
            >
            <figcaption>Ghost · click to copy</figcaption>
          </figure>
        </div>
        <p v-if="copyError" role="status" class="ds-note">{{ copyError }}</p>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Button sizes</h3>
        <div class="cluster">
          <AppButton size="small">Small</AppButton><AppButton>Default</AppButton
          ><AppButton size="large">Large</AppButton>
        </div>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Filter tabs</h3>
        <AppFilterGroup
          v-model="courseFilter"
          label="Course"
          :options="courseOptions"
        /><AppFilterGroup v-model="monthFilter" label="Month" :options="monthOptions" tone="tint" />
        <p class="ds-note" role="status">
          {{ courseOptions.find((option) => option.value === courseFilter)?.label }} ·
          {{ monthOptions.find((option) => option.value === monthFilter)?.label }}
        </p>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Text field</h3>
        <div class="ds-fields auto-grid">
          <AppTextField
            id="ds-filled-email"
            v-model="filledEmail"
            label="Email"
            type="email"
            hint="Filled"
          /><AppTextField
            id="ds-disabled-email"
            model-value="jordan@example.com"
            label="Email"
            type="email"
            hint="Disabled"
            disabled
          />
        </div>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Registration card steps</h3>
        <p>
          Preview the summary → form → received pattern. These examples do not create a registration
          or take payment.
        </p>
        <div class="ds-registration panel flow">
          <div class="repel">
            <h4>
              {{
                registrationStep === 1
                  ? "Session summary"
                  : registrationStep === 2
                    ? "Contact information"
                    : "Thanks, Jordan"
              }}
            </h4>
            <span class="ds-mono">{{ registrationStep }} of 3</span>
          </div>
          <template v-if="registrationStep === 1"
            ><p class="ds-price">$95</p>
            <p>Fri, Nov 13 · 8:30 AM – 2:30 PM</p>
            <AppArrowButton @click="registrationStep = 2" full-width
              >Register for Fri, Nov 13</AppArrowButton
            ></template
          ><template v-else-if="registrationStep === 2"
            ><AppTextField
              id="ds-registration-name"
              model-value="Jordan"
              label="First name"
            /><AppTextField
              id="ds-registration-email"
              model-value="jordan@example.com"
              label="Email"
              type="email"
            /><AppArrowButton @click="registrationStep = 3" full-width
              >Preview received state</AppArrowButton
            ></template
          ><template v-else
            ><AppStatusPill label="Registration received · specimen" tone="success" />
            <p>
              This is a component preview. Live registration is confirmed by the server after
              checkout.
            </p></template
          ><AppButton
            v-if="registrationStep !== 1"
            variant="ghost"
            size="small"
            @click="registrationStep = 1"
            >Reset preview</AppButton
          >
        </div>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Receipt status</h3>
        <div class="cluster">
          <AppStatusPill label="Payment confirmed" tone="success" /><AppStatusPill
            label="Confirming registration"
            tone="pending"
            busy
          /><AppStatusPill label="Refund pending" tone="warning" /><AppStatusPill
            label="Payment refunded"
            tone="warning"
          /><AppStatusPill label="Registration needs attention" tone="warning" />
        </div>
      </section>
    </section>

    <section id="ds-patterns" class="ds-sheet flow" aria-labelledby="ds-patterns-title">
      <header class="ds-section-heading flow">
        <h2 id="ds-patterns-title">Page patterns</h2>
        <p>The same components compose the Home, Course and Receipt pages.</p>
      </header>
      <div class="ds-table-scroll" tabindex="0" role="region" aria-label="Page patterns">
        <table class="ds-table">
          <thead>
            <tr>
              <th scope="col">Pattern</th>
              <th scope="col">Description</th>
              <th scope="col">Pages</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Site navigation</th>
              <td>Approved wordmark, links, Apply and phone actions; responsive menu.</td>
              <td>Home · Course</td>
            </tr>
            <tr>
              <th scope="row">Photo hero</th>
              <td>Rounded photo with overlay, display type and overlapping audience chooser.</td>
              <td>Home</td>
            </tr>
            <tr>
              <th scope="row">Section panel</th>
              <td>White surface, shared spacing and intrinsic grids.</td>
              <td>Home · Course</td>
            </tr>
            <tr>
              <th scope="row">Summary / register card</th>
              <td>Sticky summary, contact information, then server-confirmed receipt.</td>
              <td>Course · Receipt</td>
            </tr>
            <tr>
              <th scope="row">Apply band</th>
              <td>Teal panel, faint rooster flourish, arrow and phone actions.</td>
              <td>Home</td>
            </tr>
            <tr>
              <th scope="row">Footer</th>
              <td>Approved wordmark, link columns and legal row on a hairline.</td>
              <td>Home · Course</td>
            </tr>
          </tbody>
        </table>
      </div>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Section header &amp; panel</h3>
        <AppPanel
          ><SectionHeader
            title="Our Services"
            description="A shared heading and body introduction on the default surface."
        /></AppPanel>
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Course group</h3>
        <CourseGroup :course="sampleCourse" />
      </section>
    </section>

    <section class="ds-wide flow" aria-label="Full-width page specimens">
      <h2 class="ds-wide-title">Site navigation</h2>
      <PageHeader />
      <h2 class="ds-wide-title">Photo hero &amp; audience chooser</h2>
      <NewHero />
      <h2 class="ds-wide-title">Process section</h2>
      <CareSteps />
      <h2 class="ds-wide-title">Apply band</h2>
      <ApplyBand />
      <h2 class="ds-wide-title">Footer</h2>
      <PageFooter />
    </section>
  </main>
</template>

<style scoped>
@layer blocks {
  .design-system {
    padding-block: var(--space-600) var(--space-section);
  }
  .ds-sheet {
    --flow-space: var(--space-600);
    inline-size: min(100% - var(--wrapper-gutter) * 2, 64rem);
    margin-inline: auto;
    padding: var(--space-section) var(--space-panel);
    background: var(--clr-surface);
  }
  .ds-sheet + .ds-sheet {
    margin-block-start: var(--space-600);
  }
  .ds-cover {
    min-block-size: min(70svh, 46rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .ds-cover h1 {
    max-inline-size: 14ch;
    color: var(--clr-primary-500);
    font-size: var(--text-display-lg);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }
  .ds-cover h1 span {
    color: var(--clr-text);
  }
  .ds-intro {
    max-inline-size: var(--measure-readable);
    font-size: var(--text-body-lg);
  }
  .ds-eyebrow,
  .ds-pages {
    font-family: var(--ff-mono);
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
  }
  .ds-eyebrow {
    color: var(--clr-accent-600);
    text-transform: uppercase;
    letter-spacing: var(--tracking-eyebrow);
  }
  .ds-section-heading {
    --flow-space: var(--space-400);
  }
  .ds-section-heading h2 {
    color: var(--clr-primary-500);
    font-size: var(--text-heading-2);
    font-weight: var(--fw-regular);
    letter-spacing: var(--tracking-heading);
  }
  .ds-heading {
    color: var(--clr-text);
    font-size: var(--text-heading-4);
    font-weight: var(--fw-medium);
    line-height: var(--lh-snug);
  }
  .ds-note,
  .ds-type-meta {
    color: var(--clr-text-muted);
    font-size: var(--text-small);
  }
  .ds-pages {
    color: var(--clr-text-subtle);
  }
  .ds-table-scroll {
    max-inline-size: 100%;
    overflow-x: auto;
  }
  .ds-table {
    inline-size: 100%;
    min-inline-size: 34rem;
    border-collapse: collapse;
    color: var(--clr-text);
    font-size: var(--text-small);
  }
  .ds-table :is(th, td) {
    padding: var(--space-400) var(--space-300);
    border-block-end: var(--border-width) solid var(--clr-border);
    text-align: start;
    font-weight: var(--fw-regular);
    vertical-align: middle;
  }
  .ds-table thead {
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
  }
  .ds-table :is(td, th):first-child {
    padding-inline-start: 0;
  }
  .ds-table :is(td, th):last-child {
    padding-inline-end: 0;
  }
  .ds-table code,
  .ds-shapes code {
    font-size: var(--text-meta);
    overflow-wrap: anywhere;
  }
  .ds-swatch {
    display: block;
    inline-size: 3rem;
    block-size: 2.25rem;
    border: var(--border-width) solid color-mix(in srgb, var(--clr-border) 35%, transparent);
    border-radius: var(--radius-input);
  }
  .ds-mono,
  code {
    font-family: var(--ff-mono);
  }
  .ds-fonts {
    --auto-grid-min: 14rem;
    --auto-grid-gap: var(--space-600);
  }
  .ds-font-example {
    color: var(--clr-text);
    font-size: var(--text-display-md);
  }
  .ds-type-row {
    padding-block: var(--space-500);
    border-block-end: var(--border-width) solid var(--clr-border);
  }
  .ds-type-sample {
    color: var(--clr-text);
    font-size: var(--specimen-size, var(--text-body));
    font-weight: var(--specimen-weight, var(--fw-regular));
    line-height: var(--specimen-leading, var(--lh-body));
    letter-spacing: var(--specimen-tracking, normal);
    overflow-wrap: anywhere;
  }
  .ds-type-sample--italic {
    font-style: italic;
  }
  .ds-type-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-300) var(--space-500);
    margin-block-start: var(--space-400);
  }
  .ds-type-meta code {
    font-size: var(--text-meta);
  }
  .ds-numerals {
    color: var(--clr-text);
    font-size: var(--text-numeral);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
    --cluster-gap: var(--space-600);
  }
  .ds-space-bar {
    display: block;
    max-inline-size: 8rem;
    min-inline-size: var(--space-100);
    block-size: var(--space-300);
    border-radius: var(--radius-pill);
    background: var(--clr-primary-500);
  }
  .ds-layout-values {
    --auto-grid-min: 16rem;
  }
  .ds-shapes {
    --auto-grid-min: 9rem;
    --auto-grid-gap: var(--space-600);
  }
  .ds-shape {
    display: grid;
    place-items: center;
    inline-size: 6rem;
    block-size: 5rem;
    margin-block-end: var(--space-300);
    background: var(--clr-primary-100);
    color: var(--clr-primary-500);
    font-size: var(--text-heading-4);
  }
  .ds-elevations {
    --auto-grid-min: 12rem;
    --auto-grid-gap: var(--space-500);
  }
  .ds-elevation {
    padding: var(--space-500);
    border-radius: var(--radius-inner);
    background: var(--clr-surface);
  }
  .ds-elevation--one {
    box-shadow: var(--shadow-100);
  }
  .ds-elevation--two {
    box-shadow: var(--shadow-200);
  }
  .ds-specimen {
    --flow-space: var(--space-400);
    padding-block: var(--space-500);
  }
  .ds-specimen + .ds-specimen {
    margin-block-start: var(--space-600);
  }
  .ds-fields {
    --auto-grid-min: 14rem;
    --auto-grid-gap: var(--space-500);
  }
  .ds-card-grid {
    --auto-grid-min: 18rem;
    --auto-grid-gap: var(--space-500);
  }
  .ds-step-list {
    --auto-grid-min: 12rem;
    --auto-grid-gap: var(--space-400);
  }
  .ds-state-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--space-500);
  }
  .ds-state-grid figure {
    display: grid;
    gap: var(--space-300);
  }
  .ds-state-grid figcaption {
    max-inline-size: 24ch;
    font-family: var(--ff-mono);
    font-size: var(--text-meta);
  }
  .ds-receipt {
    overflow: hidden;
    border-radius: var(--radius-card);
    background: var(--clr-surface);
    box-shadow: var(--shadow-100);
  }
  .ds-registration {
    --flow-space: var(--space-500);
    max-inline-size: 30rem;
    background: var(--clr-surface-muted);
  }
  .ds-registration h4 {
    font-size: var(--text-heading-4);
  }
  .ds-price {
    color: var(--clr-text);
    font-size: var(--text-heading-2);
  }
  .ds-wide {
    --flow-space: var(--space-600);
    margin-block-start: var(--space-section);
  }
  .ds-wide-title {
    inline-size: min(100% - var(--wrapper-gutter) * 2, 64rem);
    margin-inline: auto;
    color: var(--clr-text);
    font-size: var(--text-heading-2);
  }
  @media print {
    .ds-sheet {
      inline-size: 100%;
      break-after: page;
    }
    .ds-table-scroll {
      overflow: visible;
    }
    .ds-sheet,
    .ds-wide {
      margin: 0;
    }
  }
}
</style>
