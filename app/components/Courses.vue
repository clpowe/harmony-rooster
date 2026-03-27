<script setup lang="ts">
import { useCourses } from "@/composables/useCourses";

const { courses } = useCourses();
</script>

<template>
  <section id="courses" class="courses-section u-card u-surface-2">
    <div class="courses-section__intro l-flow">
      <Typography tag="h2" variant="heading-medium">
        <span>Courses We</span> <span>Offer</span>
      </Typography>
      <Typography tag="p" variant="text"
        >Harmony Rooster, LLC is a locally owned and operated company based in Tampa, Florida. The
        company was founded by Derek and Cynthia Robinson, who are passionate about providing
        exceptional in-home care services that empower individuals to live their best
        lives.</Typography
      >
    </div>
    <div v-if="courses" class="courses-section__list">
      <div v-for="course in courses" :key="course.id" class="course-group">
        <div class="course-group__header">
          <div class="course-group__content l-flow">
            <Typography tag="h3" variant="heading-small">{{ course.course_name }}</Typography>
            <Typography tag="p" variant="text">{{ course.description }}</Typography>
          </div>
          <div class="course-group__price">
            <Typography tag="p" variant="text-large">Price ${{ course.cost }}.00</Typography>
          </div>
        </div>
        <ul class="course-group__sessions u-list-reset">
          <li v-for="session in course.sessions" :key="session.id">
            <CourseCard
              :course-id="course.id"
              :session
              :course-name="course.course_name"
              :course-price="course.cost"
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.courses-section {
  display: grid;
  gap: var(--space-lg);
}

.courses-section__list {
  display: grid;
  gap: var(--space-lg);
}

.course-group {
  display: grid;
  gap: var(--space-md);
}

.course-group__sessions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-sm);
}

.course-group__header {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.course-group__content {
  --flow-space: var(--space-xxs);
}

.course-group__content :deep(h3) {
  color: var(--primary-500);
  text-transform: uppercase;
}

.course-group__price {
  place-self: start;
  display: inline-flex;
  align-items: center;
  background: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .course-group__header {
    flex-direction: row;
  }

  .course-group__price {
    place-self: end;
  }
}
</style>
