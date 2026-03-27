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
</script>

<template>
  <article class="session-card">
    <header class="session-card__header">
      <time class="session-card__date" :datetime="session.date">
        <Icon name="lucide:calendar" class="session-card__icon" aria-hidden="true" />
        {{ formatDate(session.date) }}
      </time>
      <span class="session-card__status" v-if="session.spots_available == 0" aria-label="Price">
        FULL
      </span>
    </header>

    <ul class="session-card__details u-list-reset">
      <li class="session-card__detail">
        <Icon name="lucide:clock" class="session-card__icon" aria-hidden="true" />
        <div class="session-card__detail-body">
          <span class="session-card__label">Time</span>
          <span class="session-card__value">{{ session.time }}</span>
        </div>
      </li>

      <li class="session-card__detail">
        <Icon name="lucide:map-pin" class="session-card__icon" aria-hidden="true" />
        <div class="session-card__detail-body">
          <span class="session-card__label">Location</span>
          <span class="session-card__value">{{ session.location }}</span>
        </div>
      </li>

      <li class="session-card__detail">
        <Icon name="lucide:users" class="session-card__icon" aria-hidden="true" />
        <div class="session-card__detail-body">
          <span class="session-card__label">Available</span>
          <span class="session-card__value">{{ session.spots_available }} seats</span>
        </div>
      </li>
    </ul>
    <div class="session-card__actions">
      <NuxtLink
        class="button button--md button--primary"
        :to="{
          name: 'course-register',
          query: { session_id: session.id, course_id: courseId },
        }"
      >
        Register
      </NuxtLink>
    </div>
  </article>
</template>

<style>
.session-card {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.session-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-1);
  transform: translateY(-2px);
}

.session-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.session-card__date {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--primary-600);
  font-weight: 600;
  font-size: 1rem;
}

.session-card__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--primary-500);
}

.session-card__status {
  background: var(--danger-500);
  color: var(--neutral-50);
  padding: var(--space-xxs) var(--space-xs);
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.875rem;
}

.session-card__details {
  display: grid;
  gap: var(--space-sm);
}

.session-card__detail {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
}

.session-card__detail .session-card__icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
}

.session-card__detail-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.session-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-2);
  font-weight: 500;
}

.session-card__value {
  font-size: 1.15rem;
  color: var(--text-1);
  font-weight: 500;
}

.session-card__actions {
  display: flex;
}

.session-card__actions .button {
  margin-top: var(--space-xs);
  width: 100%;
  justify-content: center;
}
</style>
