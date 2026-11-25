<script setup lang="ts">
import type { Session, Course } from "@types/courses";
import { getReceiptStatus } from "@utils/receipt-status";
import ReceiptHeader from "@/components/receipt/ReceiptHeader.vue";
import { examples } from "@/design-system/component-examples";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Design system",
  description: "Harmony Roosters design tokens, component specimens, states, and page patterns.",
  robots: "noindex, nofollow",
});

const navDialogOpen = ref(false);

const route = useRoute();
const printOnly = computed(() => route.query.print === "sample");

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
function preventDemoSubmission(event: SubmitEvent) {
  if (event.target instanceof HTMLFormElement && event.target.matches(".contact-form")) {
    event.preventDefault();
    event.stopPropagation();
  }
}
function preventDemoNavigation(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (!link || link.closest(".reference-content") || link.matches("[data-print-link]")) return;
  if (!link.getAttribute("href")?.startsWith("#")) event.preventDefault();
}
</script>

<template>
  <main v-if="printOnly">
    <DesignSystemPatterns print-only />
  </main>
  <main
    v-else
    class="design-system"
    @click.capture="preventDemoNavigation"
    @submit.capture="preventDemoSubmission"
  >
    <header class="ds-sheet ds-cover flow">
      <h1>Harmony Roosters<br /><span>Design system</span></h1>
      <p class="ds-intro">
        Resolved design tokens, brand assets, and reusable examples from the Harmony Roosters
        application.
      </p>
    </header>

    <div class="ds-sheet ds-reference flow">
      <DesignSystemReference />
    </div>

    <section id="ds-components" class="ds-sheet flow" aria-labelledby="ds-components-title">
      <header class="ds-section-heading flow">
        <h2 id="ds-components-title">Components</h2>
        <p>
          Hover, press or use Tab to inspect interactive states. Recipes use the same CSS as the
          application and link to the shared foundation. To use a recipe on another host, serve the
          foundation, token CSS and font files at the paths shown, or point the links at the
          corresponding deployed files.
        </p>
      </header>
      <section class="ds-specimen flow" aria-labelledby="ds-typography-component">
        <h3 id="ds-typography-component" class="ds-heading">Typography</h3>
        <p>
          Display XL uses 0.94 leading, and display LG uses 0.98. Section headings use 1.0,
          subsection and compact headings use 1.05, and body variants use 1.55. Heading weights are
          400 except for the compact heading at 500. Display tracking is −0.045em and other heading
          tracking is −0.03em. The uppercase modifier uses +0.04em and the bold modifier uses weight
          600.
        </p>
        <Typography tag="p" variant="heading-medium">Care you can <span>trust</span></Typography>
        <Typography tag="p" variant="body-medium"
          >Body text follows the shared type scale.</Typography
        >
        <DesignSystemCode title="Typography HTML + CSS" :code="examples.typography" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-buttons">
        <h3 id="ds-buttons" class="ds-heading">Button</h3>
        <p>Five variants share the same pill geometry.</p>
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
        <p>
          Default 48px minimum, 0 × 24px padding, 17px size and weight 500. Small is 44px with 16px
          inline padding and 15px type. Large is 56px with 32px inline padding. All use a 1px border
          and 999px radius. The coarse-pointer rule changes the default minimum to 44px. Loading
          retains the variant colors, shows a one-second spinner and disables activation.
        </p>
        <DesignSystemCode title="Button HTML + CSS" :code="examples.buttons" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-arrows">
        <h3 id="ds-arrows" class="ds-heading">Arrow button</h3>
        <p>Primary CTA with a 48px icon disc. Full-width in cards, inverted on teal.</p>
        <p class="ds-pages">Home · Course</p>
        <AppArrowButton full-width>Register for Fri, Nov 13</AppArrowButton
        ><AppPanel as="div" tone="primary"
          ><AppArrowButton variant="inverse">Apply now</AppArrowButton></AppPanel
        >
        <p>
          Minimum height 64px, with 8px top, right and bottom padding and 24px at the inline start.
          The 1px border can make the rendered height 66px around the 48px disc. The shared pill
          radius and variant focus outline apply.
        </p>
        <DesignSystemCode title="Arrow button HTML + CSS" :code="examples.arrows" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-links">
        <h3 id="ds-links" class="ds-heading">Text link &amp; icon button</h3>
        <p>Arrow link with amber underline on hover. A 48px round button for scrolling controls.</p>
        <div class="cluster">
          <AppTextLink href="#ds-components">Explore component examples</AppTextLink
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
        <p>
          Text links use a 44px minimum height, 8px icon gap, 17px type and weight 500. Icon buttons
          are 48px wide and 48px tall on fine pointers, with zero padding, a 1px border and a 999px
          radius. The coarse-pointer height is 44px.
        </p>
        <DesignSystemCode title="Text link and icon button HTML + CSS" :code="examples.links" />
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
        <p>
          Tags use 4px × 12px padding, a 4px gap and 14px type with 1.2 leading. Status pills use
          8px × 12px padding and an 8px gap with the same type metrics. Both have a 999px radius and
          no border. The busy status icon rotates every 960ms and rests with reduced motion.
        </p>
        <DesignSystemCode title="Tags and status pills HTML + CSS" :code="examples.tags" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-fields">
        <h3 id="ds-fields" class="ds-heading">Text field</h3>
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
        <p>
          Inputs use a 56px minimum height, 12px × 16px padding, a 14px radius and 1px border.
          Textareas have a 160px minimum. The 3px teal 100 focus halo has zero offset. Error borders
          use danger and remain on focus.
        </p>
        <DesignSystemCode title="Text field HTML + CSS" :code="examples.fields" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-details">
        <h3 id="ds-details" class="ds-heading">Detail row &amp; summary row</h3>
        <p>
          Icon disc with label/value for class facts (supports <code>--detail-icon-bg</code> for
          muted surfaces and <code>external</code> outbound links); two-column rows for order data
          with semantic <code>status</code> tones.
        </p>
        <p class="ds-pages">Course · Receipt</p>
        <dl class="ds-detail-muted panel u-surface-muted">
          <AppDetailRow
            icon="lucide:calendar-days"
            label="Date"
            value="Friday, October 16, 2026"
          /><AppDetailRow
            icon="lucide:map-pin"
            label="Location"
            value="St. Mary Baptist Church"
            href="#ds-details"
            link-label="Directions"
            external
          />
        </dl>
        <dl>
          <AppSummaryRow label="Registrant" value="Jordan Ellis" /><AppSummaryRow
            label="Payment"
            value="Visa ending in 4242"
          /><AppSummaryRow
            label="Status (confirmed)"
            value="Payment received"
            status="success"
          /><AppSummaryRow
            label="Status (pending)"
            value="Not yet paid"
            status="pending"
          /><AppSummaryRow
            label="Status (warning)"
            value="Review required"
            status="warning"
          /><AppSummaryRow label="Order number" value="…WD4Wjdlx" mono />
        </dl>
        <CourseRegistrationDetail
          icon="lucide:clock-4"
          label="Compact course detail"
          value="8:30 AM – 2:30 PM"
        />
        <p>
          Detail rows have an 80px minimum, 16px vertical padding, a 48px icon disc and a 1px bottom
          rule. Summary rows use 16px vertical padding, a 16px gap and a 1px top rule. Both grow
          with content.
        </p>
        <DesignSystemCode title="Detail and summary rows HTML + CSS" :code="examples.details" />
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
          selected-variant="tint"
          legend="Selected · Tint"
        /><CourseSessionSelector
          v-model="solidSession"
          :sessions="sessions"
          selected-variant="solid"
          legend="Selected · Solid"
        />
        <p class="ds-note" role="status">Selected example: {{ selectedSession }}</p>
        <p>
          Tiles use 16px padding, 20px radius, a 1px outline border and 8px content gaps. The strip
          uses 152–180px columns with a 12px gap. Its scroll controls are 36px square, with zero
          padding and a 1px pill border. Keyboard focus outlines the whole tile.
        </p>
        <DesignSystemCode title="Session tile and selector HTML + CSS" :code="examples.selection" />
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
        <p>
          Use 16px row padding and gaps, with a 1px bottom rule. The meter track is 6px tall, at
          least 48px wide and fully rounded.
        </p>
        <DesignSystemCode title="Session row and seat meter HTML + CSS" :code="examples.rows" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-course-card">
        <h3 id="ds-course-card" class="ds-heading">Course card</h3>
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
        <p>
          Course cards have a 20px radius, 32px padding, 16px gaps, and the full shadow-100. Their
          small actions use a 40px minimum height, 14px type, weight 400 and a 4px hover-ring
          spread.
        </p>
        <DesignSystemCode title="Course card HTML + CSS" :code="examples.cards" />
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
        <p>
          Step cards have 24px padding, 28px radius and 16px content gaps. Trust badges have a 48px
          pill disc, a 12px gap and 15px type.
        </p>
        <DesignSystemCode title="Step card and trust badge HTML + CSS" :code="examples.steps" />
        <DesignSystemCode title="Trust list HTML + CSS" :code="examples.trust" />
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
        <p>
          The summary has 20px vertical padding, a 16px gap and a 1px top rule on the row. The 52px
          disc has a 1px border, pill radius and a 45° rotation when open. The answer has 24px
          bottom padding.
        </p>
        <DesignSystemCode title="Accordion HTML + CSS" :code="examples.accordion" />
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
        <p>
          The rule is 8px tall, with 75% teal and 25% amber. Content padding is clamp(2rem, 4vw,
          3.5rem), with a 20px stack gap.
        </p>
        <DesignSystemCode title="Receipt header HTML + CSS" :code="examples.receipt" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-nav-dialog">
        <h3 id="ds-nav-dialog" class="ds-heading">Navigation dialog</h3>
        <p>
          Floating mobile menu built on a native modal dialog: focus trap, Esc and backdrop dismiss,
          CSS enter and exit animation.
        </p>
        <AppButton @click="navDialogOpen = true">Open navigation dialog</AppButton>
        <AppNavDialog v-model="navDialogOpen" label="Example menu">
          <ul role="list" class="u-list-reset">
            <li><AppTextLink href="#ds-nav-dialog" :icon="undefined">Our Services</AppTextLink></li>
            <li><AppTextLink href="#ds-nav-dialog" :icon="undefined">Courses</AppTextLink></li>
          </ul>
          <AppButton href="#ds-nav-dialog" @click="navDialogOpen = false">Apply now</AppButton>
        </AppNavDialog>
        <p>
          Width is capped at 512px and height at calc(100dvh - 2rem). Set a 16px top margin, 24px
          inner padding, panel radius and shadow-200. The scrim uses oklch(21.46% 0 0 / 0.55). Entry
          and exit use 480ms and cubic-bezier(0.22, 1, 0.36, 1).
        </p>
        <DesignSystemCode title="Navigation dialog HTML + CSS" :code="examples.dialog" />
      </section>
      <section class="ds-specimen flow" aria-labelledby="ds-wordmark">
        <h3 id="ds-wordmark" class="ds-heading">Wordmark</h3>
        <p>Two-line brand wordmark, teal over amber.</p>
        <p class="ds-pages">All pages</p>
        <SiteBrand />
        <DesignSystemCode title="Wordmark HTML + CSS" :code="examples.wordmark" />
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
        <p>
          Solid and tinted filters are native pressed buttons. They use 44px minimum height, 1px
          borders and 999px radius. Padding is 8px × 20px in solid mode and 8px × 16px in tint mode.
          Use 17px type for solid and 15px for tint, weight 500 and leading 1.2.
        </p>
        <AppFilterGroup
          v-model="courseFilter"
          label="Course"
          :options="courseOptions"
        /><AppFilterGroup v-model="monthFilter" label="Month" :options="monthOptions" tone="tint" />
        <DesignSystemCode title="Filter tabs HTML + CSS" :code="examples.filters" />
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
        <p>
          The live registration card uses 32px padding, 20px radius and shadow-100. Its arrow action
          uses a 52px minimum, a 36px disc and 14px type. The contact step uses 16px field gaps and
          a teal-tint banner with a 16px radius and 12px × 16px padding.
        </p>
        <DesignSystemCode title="Registration card HTML + CSS" :code="examples.registration" />
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

    <section class="ds-sheet flow" aria-labelledby="ds-new-patterns">
      <DesignSystemPatterns />
      <DesignSystemCode title="Existing contact form HTML + CSS" :code="examples.contact" />
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
              <td>Home · Course · Receipt</td>
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
        <DesignSystemCode title="Panel HTML + CSS" :code="examples.panel" />
      </section>
      <section class="ds-specimen flow">
        <h3 class="ds-heading">Course group</h3>
        <CourseGroup :course="sampleCourse" />
        <p>
          Each panel uses a 20px radius, 32px padding and shadow-100. Session rows use 16px gaps and
          block padding, with 1px separators. Compact Register buttons share the 40px minimum height
          and 4px hover ring of course cards.
        </p>
        <DesignSystemCode title="Course group HTML + CSS" :code="examples.courseGroup" />
      </section>
    </section>

    <section class="ds-wide flow" aria-label="Full-width page specimens">
      <h2 class="ds-wide-title">Site navigation</h2>
      <PageHeader />
      <h2 class="ds-wide-title">Photo hero &amp; audience chooser</h2>
      <NewHero />
      <h2 class="ds-wide-title">Process section</h2>
      <CareSteps />
      <div class="ds-wide-title ds-wide-code">
        <DesignSystemCode title="Care steps HTML + CSS" :code="examples.careSteps" />
      </div>
      <h2 class="ds-wide-title">Apply band</h2>
      <ApplyBand />
      <div class="ds-wide-title ds-wide-code">
        <DesignSystemCode title="Apply band HTML + CSS" :code="examples.applyBand" />
      </div>
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
  .ds-sheet + .ds-sheet:not(.ds-reference) {
    margin-block-start: var(--space-600);
  }
  .ds-sheet.ds-cover {
    padding-block-end: var(--space-500);
  }
  .ds-sheet.ds-reference {
    padding-block-start: var(--space-500);
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
  .ds-pages {
    font-family: var(--ff-mono);
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
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
  .ds-note {
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
  .ds-mono,
  code {
    font-family: var(--ff-mono);
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
  .ds-detail-muted {
    --detail-icon-bg: var(--clr-surface);
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
  .ds-wide-code {
    font-size: var(--text-body);
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
