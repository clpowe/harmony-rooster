<script setup lang="ts">
import type { Session } from "@types/courses";
import { getSessionMonth } from "@utils/course-filters";
import { getSeatAvailability } from "@utils/seatAvailability";

const props = defineProps<{
  session: Session;
  courseName: string;
  courseId: string;
  coursePrice: number;
}>();

const seats = computed(() =>
  getSeatAvailability(props.session.spots_available, props.session.capacity),
);
const registrationHref = computed(
  () =>
    `/course/register?session_id=${encodeURIComponent(props.session.id)}&course_id=${encodeURIComponent(props.courseId)}`,
);
const calendarDate = computed(() =>
  getSessionMonth(props.session.date) ? props.session.date.trim().slice(0, 10) : undefined,
);
const dateLabel = computed(() =>
  calendarDate.value
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${calendarDate.value}T12:00:00.000Z`))
    : "Date to be confirmed",
);
const fullDateLabel = computed(() =>
  calendarDate.value
    ? `${formatDate(calendarDate.value)}, ${calendarDate.value.slice(0, 4)}`
    : dateLabel.value,
);
const priceLabel = computed(() =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(props.coursePrice) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(props.coursePrice),
);
</script>

<template>
  <article class="course-card" :data-state="seats.state">
    <header class="course-card__header repel">
      <AppTag :datetime="calendarDate" icon="lucide:calendar" :aria-label="fullDateLabel">
        {{ dateLabel }}
      </AppTag>
      <p class="course-card__price">
        <span class="visually-hidden">Session cost: </span>{{ priceLabel }}
      </p>
    </header>

    <h3 class="course-card__title">{{ courseName }}</h3>

    <dl class="course-card__details cluster">
      <div class="course-card__detail">
        <dt class="visually-hidden">Time</dt>
        <dd class="course-card__detail-value">
          <AppIcon name="lucide:clock" class="course-card__icon" />
          <span>{{ session.time }}</span>
        </dd>
      </div>
      <div class="course-card__detail">
        <dt class="visually-hidden">Location</dt>
        <dd class="course-card__detail-value">
          <AppIcon name="lucide:map-pin" class="course-card__icon" />
          <span>{{ session.location }}</span>
        </dd>
      </div>
    </dl>

    <footer class="course-card__footer cluster">
      <AppButton
        :href="seats.isFull ? undefined : registrationHref"
        :disabled="seats.isFull"
        size="small"
        :aria-label="
          seats.isFull
            ? `${courseName} on ${fullDateLabel} is full`
            : `Register for ${courseName} on ${fullDateLabel}`
        "
      >
        {{ seats.isFull ? "Full" : "Register" }}
      </AppButton>

      <NuxtLink :to="registrationHref" class="course-card__details-link">
        <span>Details</span>
        <span class="visually-hidden"> for {{ courseName }} on {{ fullDateLabel }}</span>
        <AppIcon name="lucide:arrow-right" class="course-card__details-icon" />
      </NuxtLink>
    </footer>
  </article>
</template>

<style scoped>
@layer blocks {
  .course-card {
    --button-small-height: 2.5rem;
    --button-small-font-size: var(--text-caption);
    --button-weight: var(--fw-regular);
    --button-ring-size: 4px;

    display: flex;
    flex-direction: column;
    gap: var(--space-400);
    min-inline-size: 0;
    padding: var(--space-600);
    border-radius: var(--radius-300);
    background-color: var(--clr-surface);
    box-shadow: var(--shadow-100);
    color: var(--clr-text);
  }

  .course-card :deep(.tag) {
    font-family: var(--ff-base);
    font-size: var(--text-meta);
  }

  .course-card__price {
    font-size: var(--text-compact-heading);
    font-weight: var(--fw-regular);
    font-variant-numeric: tabular-nums;
    line-height: var(--lh-snug);
    color: var(--clr-text);
  }

  .course-card__title {
    color: var(--clr-text);
    font-size: clamp(1.375rem, 1.1rem + 0.9vw, 1.75rem);
    font-weight: var(--fw-regular);
    line-height: var(--lh-snug);
  }

  .course-card__details {
    --cluster-gap: var(--space-400);
    margin: 0;
  }

  .course-card__detail {
    min-inline-size: 0;
  }

  .course-card__detail-value {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    margin: 0;
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
  }

  .course-card__icon {
    --icon-size: 1rem;
    color: var(--clr-text-muted);
  }

  .course-card__footer {
    --cluster-gap: var(--space-400);
    margin-block-start: auto;
    padding-block-start: var(--space-400);
    border-block-start: var(--border-width) solid var(--clr-border);
  }

  .course-card__details-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    min-block-size: 2.5rem;
    color: var(--clr-primary-500);
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
    text-decoration: none;

    &:hover {
      color: var(--clr-primary-600);
      text-decoration: underline;
    }
  }

  .course-card__details-icon {
    --icon-size: 1rem;
  }

  .course-card[data-state="full"] {
    color: var(--clr-text-subtle);
  }
}
</style>
