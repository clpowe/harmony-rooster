<script setup lang="ts">
import { useCourses } from "@/composables/useCourses";
import { useCourseFilters } from "@/composables/useCourseFilters";

useSeoMeta({
  title: "Caregiver Training Courses | Harmony Roosters",
  description:
    "Browse upcoming Medication Administration Provider Training and caregiver courses in Riverview and Brandon, FL. Choose a course and date to register.",
});

const { courses, pending, error, refreshCourses } = useCourses();
const {
  selectedCourse,
  selectedMonth,
  courseOptions,
  monthOptions,
  filteredCourses,
  hasFilters,
  resetFilters,
} = useCourseFilters(courses);

const shortMonthOptions = computed(() =>
  monthOptions.value.map((option) => ({
    value: option.value,
    label: option.value ? (option.label.split(" ")[0] ?? option.label) : option.label,
  })),
);

const openSessionCount = computed(() =>
  filteredCourses.value.reduce(
    (total, course) =>
      total + (course.sessions?.filter((session) => session.spots_available > 0).length ?? 0),
    0,
  ),
);
</script>

<template>
  <main class="courses-page wrapper flow">
    <header class="courses-page__hero flow">
      <NuxtLink to="/" class="courses-page__back">
        <AppIcon name="lucide:arrow-left" class="courses-page__back-icon" />
        <span>Home</span>
      </NuxtLink>

      <div class="courses-page__intro flow">
        <p class="courses-page__eyebrow">Caregiver training</p>
        <h1 class="courses-page__title"><span class="color-primary">Courses</span> We Offer</h1>
        <p class="courses-page__lede">
          Training for direct-care professionals. Choose a course and date to register.
        </p>
      </div>

      <div v-if="courses?.length" class="courses-page__filters flow">
        <AppFilterGroup
          v-model="selectedCourse"
          label="Filter by course"
          :options="courseOptions"
        />

        <div class="courses-page__dates-row repel">
          <AppFilterGroup
            v-model="selectedMonth"
            label="Filter by month"
            :options="shortMonthOptions"
            tone="tint"
          />

          <p class="courses-page__count" role="status" aria-live="polite" aria-atomic="true">
            {{ openSessionCount }} open {{ openSessionCount === 1 ? "session" : "sessions" }}
          </p>
        </div>
      </div>
    </header>

    <div v-if="pending" class="courses-page__state panel flow" aria-live="polite" role="status">
      <Typography tag="p" variant="heading-medium">Loading upcoming courses...</Typography>
      <Typography tag="p" variant="body-medium">
        Please wait while we pull the latest schedule and seat availability.
      </Typography>
    </div>

    <div v-else-if="error" class="courses-page__state panel flow" aria-live="polite" role="status">
      <Typography tag="p" variant="heading-medium">We couldn’t load courses right now.</Typography>
      <Typography tag="p" variant="body-medium">
        Check your connection and try again. If the problem continues, contact us directly.
      </Typography>
      <AppButton variant="secondary" size="small" @click="refreshCourses()"> Try again </AppButton>
    </div>

    <template v-else-if="courses?.length">
      <div v-if="filteredCourses.length" class="courses-page__list flow">
        <CourseGroup v-for="course in filteredCourses" :key="course.id" :course="course" />
      </div>

      <div v-else class="courses-page__state panel flow" role="status">
        <Typography tag="p" variant="body-large">No sessions match these filters.</Typography>
        <Typography tag="p" variant="body-medium">
          Choose another course or month to see the available training dates.
        </Typography>
        <AppButton v-if="hasFilters" variant="secondary" size="small" @click="resetFilters">
          Show all sessions
        </AppButton>
      </div>
    </template>

    <div v-else class="courses-page__state panel flow" aria-live="polite">
      <Typography tag="p" variant="body-large">No courses are available right now.</Typography>
      <Typography tag="p" variant="body-medium">
        We’re updating the schedule. Check back soon or contact us for upcoming training dates.
      </Typography>
    </div>

    <AppPanel
      tone="primary"
      class="courses-team-band repel"
      aria-labelledby="courses-team-band-title"
    >
      <div class="courses-team-band__content flow">
        <h2 id="courses-team-band-title" class="courses-team-band__title">
          Training a <span>team?</span>
        </h2>
        <p class="courses-team-band__copy">
          Call us to register several staff members or ask about upcoming dates.
        </p>
      </div>

      <AppButton href="tel:+18134340447" variant="accent" size="small">
        <template #icon-start><AppIcon name="lucide:phone" /></template>
        813-434-0447
      </AppButton>
    </AppPanel>
  </main>
</template>

<style scoped>
@layer blocks {
  .courses-page {
    --flow-space: var(--space-700);
    --button-small-height: 2.5rem;
    --button-small-font-size: var(--text-caption);
    --button-weight: var(--fw-regular);
    --button-ring-size: 4px;
    --button-accent: var(--clr-accent-400);

    padding-block: var(--space-500) var(--space-800);
  }

  .courses-page__hero {
    --flow-space: var(--space-500);
  }

  .courses-page__back {
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

  .courses-page__back-icon {
    --icon-size: 0.875rem;
  }

  .courses-page__intro {
    --flow-space: var(--space-300);
  }

  .courses-page__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--clr-text-muted);
  }

  .courses-page__title {
    color: var(--clr-text);
    font-size: var(--text-display-lg);
    font-weight: var(--fw-regular);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }

  .courses-page__lede {
    max-inline-size: 42ch;
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
    line-height: var(--lh-base);
  }

  .courses-page__filters {
    --flow-space: var(--space-300);
  }

  .courses-page__filters :deep(.filter-group__label) {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  .courses-page__filters :deep(.filter-group__options) {
    gap: var(--space-200);
  }

  .courses-page__filters :deep(.filter-group__chip) {
    min-block-size: 2.375rem;
    padding: var(--space-200) var(--space-400);
    background-color: var(--clr-surface);
    font-size: 0.75rem;
    font-weight: var(--fw-regular);
  }

  .courses-page__filters :deep(.filter-group__chip[aria-pressed="true"]) {
    background-color: var(--clr-primary-500);
    border-color: var(--clr-primary-500);
    color: var(--clr-neutral-100);
  }

  .courses-page__filters
    :deep(.filter-group[data-tone="tint"] .filter-group__chip[aria-pressed="true"]) {
    background-color: var(--clr-primary-100);
    border-color: var(--clr-primary-500);
    color: var(--clr-primary-500);
  }

  .courses-page__dates-row {
    --repel-align: center;
    --repel-gap: var(--space-400);
  }

  .courses-page__count {
    font-family: var(--ff-mono);
    font-size: 0.75rem;
    color: var(--clr-text-muted);
  }

  .courses-page__list {
    --flow-space: var(--space-700);
  }

  .courses-page__state {
    --flow-space: var(--space-300);
    justify-items: start;
    border-radius: var(--radius-300);
    box-shadow: var(--shadow-100);
  }

  .courses-team-band {
    --repel-align: center;
    --repel-gap: var(--space-500);
    padding: var(--space-600) var(--space-700);
    border-radius: var(--radius-300);
  }

  .courses-team-band__content {
    --flow-space: var(--space-200);
  }

  .courses-team-band__title {
    font-size: clamp(1.75rem, 2.8vw, 2.5rem);
    font-weight: var(--fw-regular);
    line-height: 1.1;

    & span {
      color: var(--clr-accent-400);
    }
  }

  .courses-team-band__copy {
    font-size: var(--text-caption);
    font-style: italic;
    color: var(--clr-neutral-100);
    opacity: 0.9;
  }
}
</style>
