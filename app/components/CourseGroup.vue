<script setup lang="ts">
import type { Course } from "@/shared/types/courses";

const props = defineProps<{
  course: Course;
}>();

function formatCourseCost(cost: number | string) {
  const numericCost = Number(cost);

  if (Number.isNaN(numericCost)) {
    return `$${cost}`;
  }

  return Number.isInteger(numericCost) ? `$${numericCost}` : `$${numericCost.toFixed(2)}`;
}
</script>

<template>
  <div class="course-group">
    <div class="course-group__header">
      <div class="course-group__content l-flow">
        <Typography tag="h3" variant="heading-medium">{{ props.course.course_name }}</Typography>
        <Typography tag="p" variant="body-medium">{{ props.course.description }}</Typography>
      </div>
      <div class="course-group__price">
        <Typography tag="p" variant="body-large">
          Session Cost: {{ formatCourseCost(props.course.cost) }}
        </Typography>
      </div>
    </div>

    <ul v-if="props.course.sessions?.length" class="course-group__sessions u-list-reset">
      <li v-for="session in props.course.sessions" :key="session.id">
        <CourseCard
          :course-id="props.course.id"
          :session="session"
          :course-name="props.course.course_name"
          :course-price="props.course.cost"
        />
      </li>
    </ul>

    <div v-else class="course-group__empty">
      <p>Course Temporarily Unavailable</p>
    </div>
  </div>
</template>

<style scoped>
.course-group {
  display: grid;
  gap: var(--space-xl);
}

.course-group__sessions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(25ch, 1fr));
  gap: var(--space-md);
}

.course-group__header {
  display: grid;
  gap: var(--space-md);
  align-items: end;
}

.course-group__content {
  max-width: 27.125rem;
  --flow-space: 1rem;
}

.course-group__content :deep(h3) {
  color: var(--primary-500);
}

.course-group__content :deep(.type--text) {
  max-width: 32rem;
  color: var(--neutral-500);
  line-height: 1.2;
  opacity: 1;
}

.course-group__price {
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
  background: var(--primary-400);
  color: var(--surface-1);
}

.course-group__price :deep(.type--text-large) {
  max-width: none;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

.course-group__empty {
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding: 1.5rem 1rem;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  text-align: center;
}

.course-group__empty p {
  color: var(--text-1);
  font-size: clamp(1.375rem, 2.5vw, 2rem);
  font-weight: 600;
  line-height: 1.2;
}

@media (min-width: 960px) {
  .course-group__header {
    grid-template-columns: minmax(0, 27.125rem) auto;
    justify-content: space-between;
  }

  .course-group__price {
    justify-self: end;
  }
}
</style>
