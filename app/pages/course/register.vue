<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { getSeatAvailability } from "@utils/seatAvailability";

const route = useRoute();
const router = useRouter();
const { courses, pending, error, refreshCourses } = useCourses();
const requestedSessionId = computed(() =>
  typeof route.query.session_id === "string" ? route.query.session_id : undefined,
);
const requestedCourseId = computed(() =>
  typeof route.query.course_id === "string" ? route.query.course_id : undefined,
);
const course = computed(() => {
  const availableCourses = courses.value ?? [];
  return (
    availableCourses.find((item) =>
      item.sessions?.some((itemSession) => itemSession.id === requestedSessionId.value),
    ) ??
    availableCourses.find((item) => item.id === requestedCourseId.value) ??
    availableCourses[0]
  );
});
const sessions = computed(() =>
  [...(course.value?.sessions ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
);
const session = computed(
  () =>
    sessions.value.find((item) => item.id === requestedSessionId.value) ??
    sessions.value.find(
      (item) => !getSeatAvailability(item.spots_available, item.capacity).isFull,
    ) ??
    sessions.value[0],
);
const seats = computed(() =>
  getSeatAvailability(session.value?.spots_available ?? 0, session.value?.capacity ?? 0),
);
const step = ref<"summary" | "contact">("summary");
const isSubmitting = ref(false);
const checkoutStarted = ref(false);
const submitError = ref("");
const formHeading = ref<HTMLElement | null>(null);
const contactForm = ref<HTMLFormElement | null>(null);
const submitDisabled = computed(
  () => !session.value || seats.value.isFull || isSubmitting.value || checkoutStarted.value,
);
const selectedSessionId = computed({
  get: () => session.value?.id,
  set: (id: string | undefined) => {
    if (!id || isSubmitting.value || checkoutStarted.value) return;
    const selected = sessions.value.find((item) => item.id === id);
    if (!selected || getSeatAvailability(selected.spots_available, selected.capacity).isFull)
      return;
    void router.replace({
      query: { ...route.query, session_id: id, course_id: course.value?.id },
    });
  },
});

const titleParts = computed(() => {
  const full = course.value?.course_name?.trim() ?? "";
  const words = full.split(/\s+/);
  if (words.length >= 4) {
    return {
      leading: words.slice(0, -2).join(" "),
      accent: words.slice(-2).join(" "),
    };
  }
  if (words.length >= 2) {
    return {
      leading: words.slice(0, -1).join(" "),
      accent: words.slice(-1).join(" "),
    };
  }
  return { leading: full, accent: "" };
});

const courseRuleLabel = computed(() => {
  const text = `${course.value?.course_name ?? ""} ${course.value?.description ?? ""}`;
  if (/65g-7/i.test(text)) return "Florida Rule 65G-7";
  return undefined;
});

const audienceCopy = computed(() => {
  const text = `${course.value?.course_name ?? ""} ${course.value?.description ?? ""}`;
  if (/65g-7|medication/i.test(text)) {
    return "Unlicensed direct-care staff who manage medications or assist clients with self-administering them.";
  }
  return "Direct-care professionals and caregivers supporting individuals with developmental disabilities.";
});

const primaryLocation = computed(
  () => session.value?.location ?? sessions.value[0]?.location ?? "St. Mary Baptist Church",
);

const directionsUrl = computed(
  () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${primaryLocation.value}, FL`)}`,
);

function parseSessionDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const normalized = dateStr.trim().slice(0, 10);
  const parsed = new Date(`${normalized}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

const sessionDate = computed(() => {
  const date = parseSessionDate(session.value?.date);
  return date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "this session";
});

const fullSessionDate = computed(() => {
  const date = parseSessionDate(session.value?.date);
  return date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "Choose a session";
});

const courseCost = computed(() =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(course.value?.cost) ? 0 : 2,
  }).format(course.value?.cost ?? 0),
);

watch(requestedSessionId, () => {
  step.value = "summary";
  submitError.value = "";
});

async function showContactForm() {
  if (submitDisabled.value) return;
  step.value = "contact";
  await nextTick();
  formHeading.value?.focus();
}

const registrationSchema = z.object({
  first_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phonenumber: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      "Please enter a valid phone number",
    ),
});

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: toTypedSchema(registrationSchema),
});

const [first_name, first_nameAttrs] = defineField("first_name");
const [last_name, last_nameAttrs] = defineField("last_name");
const [email, emailAttrs] = defineField("email");
const [phonenumber, phonenumberAttrs] = defineField("phonenumber");

const submitValidated = handleSubmit(async (values) => {
  if (!session.value || !course.value || seats.value.isFull) return;

  try {
    const response = await $fetch<{ url?: string }>("/api/courses", {
      method: "POST",
      body: {
        ...values,
        session_id: session.value.id,
        course_id: course.value.id,
      },
    });

    if (!response.url) {
      submitError.value = "We could not start payment right now. Please try again.";
      return;
    }

    checkoutStarted.value = true;
    await navigateTo(response.url, { external: true });
  } catch {
    submitError.value =
      "We could not start payment right now. Your information is still here—please try again.";
  }
});

async function onSubmit(event: Event) {
  if (isSubmitting.value || checkoutStarted.value) return;
  // Lock before asynchronous validation, not just before the request.
  isSubmitting.value = true;
  submitError.value = "";
  try {
    await submitValidated(event);
  } finally {
    isSubmitting.value = false;
    if (Object.keys(errors.value).length > 0) {
      await nextTick();
      contactForm.value?.querySelector<HTMLInputElement>("[aria-invalid='true']")?.focus();
    }
  }
}
</script>

<template>
  <section class="registration-page wrapper flow">
    <NuxtLink to="/courses" class="registration-page__back">
      <AppIcon name="lucide:arrow-left" class="registration-page__back-icon" />
      <span>All courses</span>
    </NuxtLink>

    <div v-if="pending && !course" class="panel flow" role="status">
      <h1 class="registration-page__state-title">Loading course details</h1>
      <p>Finding the available sessions.</p>
    </div>

    <template v-else-if="course">
      <header class="registration-page__hero flow">
        <p class="registration-page__eyebrow">
          Caregiver training<template v-if="courseRuleLabel"> · {{ courseRuleLabel }}</template>
        </p>
        <h1 class="registration-page__title">
          <span>{{ titleParts.leading }}</span>
          <span v-if="titleParts.accent" class="registration-page__title-accent color-primary">
            {{ titleParts.accent }}
          </span>
        </h1>
      </header>

      <CourseSessionSelector
        v-model="selectedSessionId"
        :sessions="sessions"
        legend="Upcoming sessions"
        selected-variant="solid"
        :disabled="isSubmitting || checkoutStarted"
      />

      <div class="registration-page__layout split">
        <div class="registration-page__details-panel panel">
          <section class="registration-page__section flow" aria-labelledby="about-course-title">
            <h2 id="about-course-title" class="registration-page__section-title">
              About this course
            </h2>
            <p class="registration-page__body">
              {{ course.description }}
            </p>
          </section>

          <hr class="registration-page__divider" />

          <section class="registration-page__section flow" aria-labelledby="who-its-for-title">
            <h2 id="who-its-for-title" class="registration-page__section-title">Who it's for</h2>
            <p class="registration-page__body">
              {{ audienceCopy }}
            </p>
          </section>

          <hr class="registration-page__divider" />

          <section class="registration-page__section flow" aria-labelledby="course-location-title">
            <h2 id="course-location-title" class="registration-page__section-title">Location</h2>
            <div class="registration-page__location-bar repel">
              <p class="registration-page__location-name">{{ primaryLocation }}</p>
              <a
                :href="directionsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="registration-page__directions"
              >
                <span>Get directions</span>
                <AppIcon name="lucide:arrow-up-right" class="registration-page__directions-icon" />
              </a>
            </div>

            <div class="registration-page__map" role="img" :aria-label="`Map · ${primaryLocation}`">
              <div class="registration-page__map-placeholder">
                <AppIcon name="lucide:image" class="registration-page__map-icon" />
                <p class="registration-page__map-title">Map · {{ primaryLocation }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="registration-card panel flow" aria-labelledby="registration-title">
          <template v-if="step === 'summary'">
            <div id="registration-title" ref="formHeading" tabindex="-1" class="visually-hidden">
              Reserve your seat
            </div>

            <div class="registration-card__top repel">
              <p class="registration-card__price">
                <span class="registration-card__amount">{{ courseCost }}</span>
                <span class="registration-card__unit">per person</span>
              </p>
              <AppTag v-if="session" :variant="seats.isFull ? 'full' : 'seats'">
                {{ seats.isFull ? "FULL" : seats.label }}
              </AppTag>
            </div>

            <dl v-if="session" class="registration-card__meta">
              <div class="registration-card__meta-row">
                <span class="registration-card__meta-icon" aria-hidden="true">
                  <AppIcon name="lucide:calendar" />
                </span>
                <div class="registration-card__meta-copy">
                  <dt>Date</dt>
                  <dd>{{ fullSessionDate }}</dd>
                </div>
              </div>

              <div class="registration-card__meta-row">
                <span class="registration-card__meta-icon" aria-hidden="true">
                  <AppIcon name="lucide:clock" />
                </span>
                <div class="registration-card__meta-copy">
                  <dt>Time</dt>
                  <dd>{{ session.time }}</dd>
                </div>
              </div>

              <div class="registration-card__meta-row">
                <span class="registration-card__meta-icon" aria-hidden="true">
                  <AppIcon name="lucide:map-pin" />
                </span>
                <div class="registration-card__meta-copy">
                  <dt>Location</dt>
                  <dd>{{ session.location }}</dd>
                </div>
              </div>
            </dl>

            <p v-if="session && seats.isFull" class="registration-card__notice" role="status">
              This session is full. Choose another available date to register.
            </p>

            <AppArrowButton :disabled="submitDisabled" full-width @click="showContactForm">
              {{ session && seats.isFull ? "Session full" : `Register for ${sessionDate}` }}
            </AppArrowButton>

            <div class="registration-card__footer flow">
              <p class="registration-card__hint">
                Secure payment by Stripe. You'll get a receipt by email.
              </p>
              <p class="registration-card__hint">
                Questions? Call <a href="tel:+18134340447">813-434-0447</a>.
              </p>
            </div>
          </template>

          <form
            v-else
            ref="contactForm"
            class="registration-card__form flow"
            novalidate
            :aria-busy="isSubmitting"
            @submit.prevent="onSubmit"
          >
            <div class="registration-card__heading repel">
              <h2
                id="registration-title"
                ref="formHeading"
                tabindex="-1"
                class="registration-card__form-title"
              >
                Contact information
              </h2>
              <p class="registration-card__step">Step 2 of 3</p>
            </div>

            <div class="registration-card__session-banner repel">
              <div class="registration-card__session-banner-copy">
                <p class="registration-card__session-primary">
                  {{ sessionDate }}<template v-if="session?.time"> · {{ session.time }}</template>
                </p>
                <p class="registration-card__session-secondary">
                  {{ session?.location }} · {{ courseCost }}
                </p>
              </div>
              <button
                type="button"
                class="registration-card__change-btn"
                :disabled="isSubmitting || checkoutStarted"
                @click="step = 'summary'"
              >
                Change
              </button>
            </div>

            <div class="registration-card__names auto-grid">
              <AppTextField
                id="first_name"
                v-model="first_name"
                v-bind="first_nameAttrs"
                label="First name"
                type="text"
                autocomplete="given-name"
                placeholder="Name"
                :error="errors.first_name"
                :disabled="isSubmitting || checkoutStarted"
                required
              />
              <AppTextField
                id="last_name"
                v-model="last_name"
                v-bind="last_nameAttrs"
                label="Last name"
                type="text"
                autocomplete="family-name"
                placeholder="Name"
                :error="errors.last_name"
                :disabled="isSubmitting || checkoutStarted"
                required
              />
            </div>
            <AppTextField
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              label="Email"
              type="email"
              autocomplete="email"
              placeholder="example@example.com"
              :error="errors.email"
              :disabled="isSubmitting || checkoutStarted"
              required
            />
            <AppTextField
              id="phonenumber"
              v-model="phonenumber"
              v-bind="phonenumberAttrs"
              label="Contact number"
              type="tel"
              autocomplete="tel"
              placeholder="ex. (555)-555-5555"
              :error="errors.phonenumber"
              :disabled="isSubmitting || checkoutStarted"
              required
            />
            <p v-if="submitError" class="registration-card__notice" role="alert">
              {{ submitError }}
            </p>
            <AppArrowButton
              type="submit"
              :disabled="submitDisabled"
              :loading="isSubmitting || checkoutStarted"
              full-width
            >
              {{ isSubmitting || checkoutStarted ? "Opening payment…" : "Submit registration" }}
            </AppArrowButton>
            <p class="registration-card__hint">Next, you'll pay securely with Stripe.</p>
          </form>
        </aside>
      </div>
    </template>

    <div v-else class="panel flow">
      <h1 class="registration-page__state-title">
        {{ error ? "Course details unavailable" : "Session not found" }}
      </h1>
      <p>
        {{
          error
            ? "We could not load the available sessions. Please try again."
            : "We could not find the selected course session. Choose another date from our courses."
        }}
      </p>
      <AppButton v-if="error" :loading="pending" :disabled="pending" @click="refreshCourses()"
        >Try again</AppButton
      >
      <AppTextLink v-else href="/courses">Browse courses</AppTextLink>
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .registration-page {
    --flow-space: var(--space-600);
    padding-block: var(--space-500) var(--space-800);
  }

  .registration-page__back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    min-block-size: 2.25rem;
    padding: var(--space-100) var(--space-400);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    background-color: var(--clr-surface);
    color: var(--clr-text);
    font-size: 0.75rem;
    text-decoration: none;
    transition: border-color var(--duration-fast) var(--ease-standard);

    &:hover {
      border-color: var(--clr-primary-500);
      color: var(--clr-primary-500);
    }
  }

  .registration-page__back-icon {
    --icon-size: 0.875rem;
  }

  .registration-page__hero {
    --flow-space: var(--space-300);
  }

  .registration-page__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--clr-text-muted);
  }

  .registration-page__title {
    max-inline-size: 16ch;
    color: var(--clr-text);
    font-size: clamp(2.5rem, 5.2vw, 4.5rem);
    font-weight: var(--fw-regular);
    line-height: 1.02;
    letter-spacing: var(--tracking-display);
  }

  .registration-page__title-accent {
    display: block;
  }

  .registration-page__layout {
    --split-columns: minmax(0, 1.35fr) minmax(20rem, 0.85fr);
    --split-gap: var(--space-450);
    --split-align: start;
  }

  .registration-page__details-panel {
    display: grid;
    gap: var(--space-600);
    padding: var(--space-600);
    border-radius: var(--radius-300);
    box-shadow: var(--shadow-100);
  }

  .registration-page__section {
    --flow-space: var(--space-300);
  }

  .registration-page__section-title {
    color: var(--clr-text);
    font-size: clamp(1.5rem, 2.2vw, 1.875rem);
    font-weight: var(--fw-regular);
    line-height: var(--lh-heading);
    letter-spacing: var(--tracking-heading);
  }

  .registration-page__body {
    max-inline-size: 56ch;
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
    line-height: var(--lh-base);
  }

  .registration-page__divider {
    margin: 0;
  }

  .registration-page__location-bar {
    --repel-align: center;
  }

  .registration-page__location-name {
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
  }

  .registration-page__directions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-100);
    color: var(--clr-primary-500);
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
    text-decoration: none;

    &:hover {
      color: var(--clr-primary-600);
      text-decoration: underline;
    }
  }

  .registration-page__directions-icon {
    --icon-size: 0.875rem;
  }

  .registration-page__map {
    display: grid;
    place-items: center;
    min-block-size: 16rem;
    padding: var(--space-500);
    border-radius: var(--radius-nested);
    background-color: var(--clr-neutral-300);
    color: var(--clr-text-muted);
    text-align: center;
  }

  .registration-page__map-placeholder {
    display: grid;
    justify-items: center;
    gap: var(--space-200);
  }

  .registration-page__map-icon {
    --icon-size: 1.5rem;
    color: var(--clr-text-subtle);
  }

  .registration-page__map-title {
    font-size: var(--text-caption);
    color: var(--clr-text-muted);
  }

  .registration-page__state-title {
    font-size: var(--text-heading-2);
  }

  .registration-card {
    --flow-space: var(--space-400);
    min-inline-size: 0;
    padding: var(--space-600);
    border-radius: var(--radius-300);
    box-shadow: var(--shadow-100);
  }

  .registration-card__top {
    --repel-align: center;
  }

  .registration-card__price {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-200);
    color: var(--clr-text);
  }

  .registration-card__amount {
    font-size: clamp(2.25rem, 3.5vw, 3rem);
    font-weight: var(--fw-regular);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: var(--tracking-heading);
  }

  .registration-card__unit {
    color: var(--clr-text-muted);
    font-size: var(--text-meta);
  }

  .registration-card__meta {
    margin: 0;
    border-block-start: var(--border-width) solid var(--clr-border);
  }

  .registration-card__meta-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--space-300);
    padding-block: var(--space-300);
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .registration-card__meta-icon {
    --icon-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    border-radius: var(--radius-pill);
    background-color: var(--clr-surface-page);
    color: var(--clr-primary-500);
  }

  .registration-card__meta-copy {
    display: grid;
    gap: 0.125rem;
    min-inline-size: 0;

    & dt {
      color: var(--clr-text-muted);
      font-size: 0.75rem;
      line-height: var(--lh-snug);
    }

    & dd {
      margin: 0;
      color: var(--clr-text);
      font-size: var(--text-caption);
      line-height: var(--lh-snug);
    }
  }

  .registration-card :deep(.arrow-button) {
    --button-height: 3.25rem;
    --control-size-icon: 2.25rem;
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
  }

  .registration-card__footer {
    --flow-space: var(--space-100);
  }

  .registration-card__heading {
    --repel-align: baseline;
    --repel-gap: var(--space-200);
  }

  .registration-card__form-title {
    color: var(--clr-text);
    font-size: clamp(1.5rem, 2.2vw, 1.875rem);
    font-weight: var(--fw-regular);
    line-height: var(--lh-heading);
    letter-spacing: var(--tracking-heading);
  }

  .registration-card__step {
    font-family: var(--ff-mono);
    font-size: 0.75rem;
    color: var(--clr-text-muted);
  }

  .registration-card__session-banner {
    --repel-align: center;
    --repel-gap: var(--space-300);
    padding: var(--space-300) var(--space-400);
    border-radius: var(--radius-nested);
    background-color: var(--clr-primary-100);
  }

  .registration-card__session-banner-copy {
    display: grid;
    gap: 0.125rem;
    min-inline-size: 0;
  }

  .registration-card__session-primary {
    color: var(--clr-text);
    font-size: var(--text-caption);
    line-height: var(--lh-snug);
  }

  .registration-card__session-secondary {
    color: var(--clr-text-muted);
    font-size: 0.75rem;
    line-height: var(--lh-snug);
  }

  .registration-card__change-btn {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--clr-primary-500);
    font: inherit;
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
    cursor: pointer;

    &:hover:not(:disabled) {
      color: var(--clr-primary-600);
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .registration-card__form {
    --flow-space: var(--space-400);
  }

  .registration-card__names {
    --auto-grid-min: 10rem;
    --auto-grid-gap: var(--space-400);
  }

  .registration-card__hint {
    color: var(--clr-text-muted);
    font-size: 0.75rem;
    line-height: var(--lh-base);

    & a {
      color: var(--clr-primary-500);
    }
  }

  .registration-card__notice {
    padding: var(--space-300) var(--space-400);
    color: var(--clr-status-full-strong);
    background: var(--clr-status-full);
    border-radius: var(--radius-input);
    font-size: var(--text-caption);
    line-height: var(--lh-body);
  }

  @media (min-width: 56em) and (min-height: 50rem) {
    .registration-card {
      position: sticky;
      inset-block-start: var(--space-600);
    }
  }
}
</style>
