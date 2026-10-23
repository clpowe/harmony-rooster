<script setup lang="ts">
import { useCourses } from "@/composables/useCourses";

const { courses, pending, error, refreshCourses } = useCourses();

const featuredSessions = computed(() =>
  (courses.value ?? [])
    .flatMap((course) =>
      (course.sessions ?? []).map((session) => ({
        session,
        courseId: course.id,
        courseName: course.course_name,
        coursePrice: course.cost,
      })),
    )
    .slice(0, 2),
);
</script>

<template>
  <section id="courses" class="courses-section wrapper" aria-labelledby="courses-title">
    <header class="courses-section__header flow">
      <h2 id="courses-title" class="courses-section__title">
        <span class="color-primary">Courses</span> We Offer
      </h2>

      <div class="courses-section__subhead repel">
        <p class="courses-section__description">
          Medication Administration Provider Training for direct-care professionals who need
          instruction related to Florida Rule 65G-7.
        </p>

        <AppButton href="/courses" variant="secondary" size="small">
          All courses
          <template #icon-end><AppIcon name="lucide:arrow-right" /></template>
        </AppButton>
      </div>
    </header>

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
        class="button courses-section__retry"
        data-variant="secondary"
        type="button"
        @click="refreshCourses()"
      >
        Try again
      </button>
    </div>

    <ul v-else-if="featuredSessions.length" class="courses-section__grid u-list-reset" role="list">
      <li v-for="item in featuredSessions" :key="item.session.id" class="courses-section__item">
        <CourseCard
          :session="item.session"
          :course-id="item.courseId"
          :course-name="item.courseName"
          :course-price="item.coursePrice"
        />
      </li>
    </ul>

    <div v-else class="courses-section__state courses-section__state--empty" aria-live="polite">
      <Typography tag="p" variant="body-large">No courses are available right now.</Typography>
      <Typography tag="p" variant="body-medium">
        We’re updating the schedule. Check back soon or contact us for upcoming training dates.
      </Typography>
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .courses-section {
    --button-small-height: 2.5rem;
    --button-small-font-size: var(--text-caption);
    --button-weight: var(--fw-regular);
    --button-ring-size: 4px;

    display: grid;
    gap: var(--space-600);
  }

  .courses-section__header {
    --flow-space: var(--space-400);
  }

  .courses-section__title {
    color: var(--clr-text);
  }

  .courses-section__subhead {
    --repel-align: center;
    --repel-gap: var(--space-400);
  }

  .courses-section__description {
    max-inline-size: var(--measure);
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
  }

  .courses-section__grid {
    display: grid;
    gap: var(--space-450);

    @media (width >= 48em) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .courses-section__item {
    display: grid;
    min-inline-size: 0;
  }

  .courses-section__state {
    display: grid;
    gap: var(--space-300);
    align-content: start;
    padding: var(--space-500);
    border-radius: var(--radius-300);
    background-color: var(--clr-surface);
  }

  .courses-section__state :deep(.body-medium) {
    max-inline-size: var(--measure);
    color: var(--clr-text-muted);
  }

  .courses-section__retry {
    justify-self: start;
  }
}
</style>
