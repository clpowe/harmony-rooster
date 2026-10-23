<script setup lang="ts">
import type { Session } from "@types/courses";
import { getSeatAvailability } from "@utils/seatAvailability";

const props = defineProps<{
  session: Session;
  courseId: string;
  courseName?: string;
}>();

const seats = computed(() =>
  getSeatAvailability(props.session.spots_available, props.session.capacity),
);
const shortDate = computed(() => {
  const date = new Date(props.session.date);
  return Number.isNaN(date.getTime())
    ? "Date pending"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
});
const registrationHref = computed(
  () =>
    `/course/register?session_id=${encodeURIComponent(props.session.id)}&course_id=${encodeURIComponent(props.courseId)}`,
);
</script>

<template>
  <div class="session-row" :data-state="seats.state">
    <time class="session-row__date" :datetime="session.date">{{ shortDate }}</time>
    <AppSeatMeter
      class="session-row__meter"
      :available="session.spots_available"
      :capacity="session.capacity"
    />
    <AppTag v-if="seats.isFull" variant="full">FULL</AppTag>
    <AppButton v-else :href="registrationHref" size="small">
      Register
      <span class="visually-hidden"
        >for {{ courseName ?? "this course" }} on {{ formatDate(session.date) }}</span
      >
    </AppButton>
  </div>
</template>

<style scoped>
@layer blocks {
  .session-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-400);
    padding-block: var(--space-400);
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .session-row__date {
    min-inline-size: 5rem;
    color: var(--clr-text);
    font-size: var(--text-heading-4);
    line-height: var(--lh-snug);
  }

  .session-row__meter {
    flex: 1 1 10rem;
  }
}

@layer exceptions {
  .session-row[data-state="full"] .session-row__date {
    color: var(--clr-text-subtle);
    text-decoration: line-through;
  }
}
</style>
