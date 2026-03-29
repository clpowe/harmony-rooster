<script setup lang="ts">
import { useCourses } from "@/composables/useCourses";

const { courses, pending, error, refreshCourses } = useCourses();
</script>

<template>
  <section id="courses" class="courses-section u-card u-surface-2">
    <div class="courses-section__intro l-flow">
      <Typography tag="h2" variant="heading-large">
        <span>Courses We</span> <span>Offer</span>
      </Typography>
      <Typography tag="p" variant="text"
        >Harmony Rooster, LLC is a locally owned and operated company based in Tampa, Florida. The
        company was founded by Derek and Cynthia Robinson, who are passionate about providing
        exceptional in-home care services that empower individuals to live their best
        lives.</Typography
      >
    </div>
    <div
      v-if="pending"
      class="courses-section__state courses-section__state--loading"
      aria-live="polite"
    >
      <Typography tag="p" variant="heading-medium">Loading upcoming courses...</Typography>
      <Typography tag="p" variant="body-medium">
        Please wait while we pull the latest schedule and seat availability.
      </Typography>
    </div>

    <div
      v-else-if="error"
      class="courses-section__state courses-section__state--error"
      aria-live="polite"
      role="status"
    >
      <Typography tag="p" variant="heading-medium">We couldn’t load courses right now.</Typography>
      <Typography tag="p" variant="body-medium">
        Check your connection and try again. If the problem continues, contact us directly.
      </Typography>
      <button
        class="button button--secondary courses-section__retry"
        type="button"
        @click="refreshCourses()"
      >
        Try again
      </button>
    </div>

    <div v-else-if="courses?.length" class="courses-section__list">
      <CourseGroup v-for="course in courses" :key="course.id" :course="course" />
    </div>

    <div v-else class="courses-section__state courses-section__state--empty" aria-live="polite">
      <Typography tag="p" variant="text-large">No courses are available right now.</Typography>
      <Typography tag="p" variant="body-medium">
        We’re updating the schedule. Check back soon or contact us for upcoming training dates.
      </Typography>
    </div>
  </section>
</template>

<style scoped>
.courses-section {
  display: grid;
  gap: var(--space-xxl);
  padding: clamp(1.5rem, 3vw, 2rem) clamp(1.25rem, 2.5vw, 1.625rem);
  border-radius: var(--radius-md);
  box-shadow: none;
  background: var(--background-1-light);
}

.courses-section__intro {
  max-width: 55ch;
  --flow-space: var(--space-sm);
}

.courses-section__list {
  display: grid;
  gap: var(--space-xxl);
}

.courses-section__state {
  display: grid;
  gap: var(--space-sm);
  align-content: start;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}

.courses-section__state :deep(.type--text-large) {
  line-height: 1.3;
}

.courses-section__state :deep(.type--text) {
  max-width: 40rem;
}

.courses-section__retry {
  justify-self: start;
}

@media (min-width: 960px) {
  .courses-section {
    padding: 1.5rem 1.25rem 1.5rem 1.625rem;
  }
}
</style>
