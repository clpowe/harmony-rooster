<script setup lang="ts">
type Session = {
  id?: string;
  date: string;
  location: string;
  time: string;
  spots_available: number;
};

const props = defineProps<{
  session: Session;
  courseName?: string;
  courseId: string;
  coursePrice?: number | string;
}>();

const isFull = computed(() => props.session.spots_available === 0);
</script>

<template>
  <article class="course-card" :class="{ 'course-card--full': isFull }">
    <NuxtLink
      v-if="!isFull"
      class="course-card__overlay"
      :to="{
        name: 'course-register',
        query: { session_id: session.id, course_id: courseId },
      }"
      :aria-label="`Register for ${courseName ?? 'course'} on ${formatDate(session.date)}`"
    />

    <header class="course-card__header">
      <Typography variant="heading-small" tag="h4">
        {{ formatDate(session.date) }}
      </Typography>
    </header>

    <ul class="course-card__details u-list-reset">
      <li class="course-card__detail">
        <Icon name="lucide:clock-4" class="course-card__icon" aria-hidden="true" />
        <div class="course-card__detail-body">
          <Typography tag="p" variant="body-medium"> Time </Typography>
          <Typography tag="p" variant="body-medium">
            {{ session.time }}
          </Typography>
        </div>
      </li>

      <li class="course-card__detail">
        <Icon name="lucide:map-pin" class="course-card__icon" aria-hidden="true" />
        <div class="course-card__detail-body">
          <Typography tag="p" variant="body-medium"> Location </Typography>
          <Typography tag="p" variant="body-medium">
            {{ session.location }}
          </Typography>
        </div>
      </li>
    </ul>

    <div v-if="!isFull" class="course-card__actions">
      <span class="course-card__pill" aria-hidden="true"> Register Now </span>
    </div>

    <div v-else class="course-card__actions">
      <span class="course-card__status" aria-label="Session full">FULL</span>
    </div>
  </article>
</template>

<style scoped>
.course-card {
  position: relative;
  display: grid;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: var(--background-2-light);
  color: var(--text-1);
  overflow: clip;

  &:hover:not(.course-card--full) {
    outline: 4px solid var(--primary-400);
  }
}

.course-card:has(.course-card__overlay:focus-visible) {
  outline: 4px solid var(--primary-400);
  outline-offset: 0;
}

.course-card--full {
  color: var(--neutral-300);
  fill: var(--neutral-300);
}

.course-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
}

.course-card__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.course-card__date {
  font-size: 1.875rem;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.course-card__details {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--space-sm);
}

.course-card__detail {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xxxs);
}

.course-card__icon {
  flex-shrink: 0;
  width: 2em;
  height: 2em;
  margin-top: 1px;
}

.course-card__detail-body {
  display: grid;
  gap: var(--space-xxxs);

  p {
    leading-trim: both;
    line-height: 1;
  }
}

.course-card__label {
  color: var(--text-2);
  line-height: 1.25rem;
  font-weight: 700;
}

.course-card__actions {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  padding-top: var(--space-xs);
}

.course-card__pill,
.course-card__status {
  width: 100%;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

.course-card__pill {
  display: inline-flex;
  align-items: center;
  background: var(--button-primary);
  border: 1px solid var(--button-primary-active);
  color: var(--button-surface);
  font-size: 1rem;
  line-height: 1.2;
  text-transform: uppercase;
}

.course-card__status {
  display: inline-flex;
  align-items: center;
  background: var(--status-full-strong);
  color: var(--surface-1);
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
}

.course-card--full .course-card__date,
.course-card--full .course-card__label,
.course-card--full .course-card__value,
.course-card--full .course-card__icon {
  color: var(--text-2);
}

@media (max-width: 480px) {
  .course-card__date {
    font-size: 1.5rem;
  }
}
</style>
