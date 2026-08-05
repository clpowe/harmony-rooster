<script setup lang="ts">
import { useCourses } from "@/composables/useCourses";

const { courses, pending, error, refreshCourses } = useCourses();
</script>

<template>
  <section id="courses" class="courses-section">
    <section-header class="courses-section__intro">
      <template #title> <span>Courses We</span> <span>Offer</span> </template>
      <template #description>
        Harmony Rooster offers Medication Administration Provider Training for direct-care
        professionals who need instruction related to Florida Rule 65G-7. The course is intended to
        support safe, responsible medication assistance through practical instruction and required
        training content.
      </template>
    </section-header>
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
      <Typography tag="p" variant="body-large">No courses are available right now.</Typography>
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
  padding: var(--space-md) var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--background-1-light);
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
