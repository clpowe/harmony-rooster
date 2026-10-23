<script setup lang="ts">
import type { Course, Session } from "@types/courses";
import { getSessionMonth } from "@utils/course-filters";
import { getSeatAvailability } from "@utils/seatAvailability";

const props = withDefaults(
  defineProps<{
    course: Course;
    initialLimit?: number;
  }>(),
  {
    initialLimit: 3,
  },
);

const expanded = ref(false);

const sortedSessions = computed(() =>
  [...(props.course.sessions ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
);

const visibleSessions = computed(() =>
  expanded.value ? sortedSessions.value : sortedSessions.value.slice(0, props.initialLimit),
);

const hiddenCount = computed(() => Math.max(0, sortedSessions.value.length - props.initialLimit));

const primarySession = computed(
  () =>
    sortedSessions.value.find((session) => session.spots_available > 0) ?? sortedSessions.value[0],
);

const formattedPrice = computed(() =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(props.course.cost) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(props.course.cost),
);

const courseBadge = computed(() => {
  const haystack = `${props.course.course_name} ${props.course.description}`.toLowerCase();
  if (haystack.includes("65g-7")) return "Rule 65G-7";
  if (haystack.includes("core competencies") || haystack.includes("new direct-care"))
    return "New staff";
  if (haystack.includes("cpr") || haystack.includes("first aid")) return "Certification";
  return undefined;
});

const courseDetailsHref = computed(() => {
  const first = primarySession.value;
  if (first) {
    return `/course/register?session_id=${encodeURIComponent(first.id)}&course_id=${encodeURIComponent(props.course.id)}`;
  }
  return `/course/register?course_id=${encodeURIComponent(props.course.id)}`;
});

function getRegistrationHref(sessionId: string) {
  return `/course/register?session_id=${encodeURIComponent(sessionId)}&course_id=${encodeURIComponent(props.course.id)}`;
}

function parseCalendarDate(dateString: string): Date | null {
  if (!getSessionMonth(dateString)) return null;
  const iso = `${dateString.trim().slice(0, 10)}T12:00:00.000Z`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMonthWeekday(dateString: string): string {
  const date = parseCalendarDate(dateString);
  if (!date) return "TBD";
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
  return `${month} · ${weekday}`;
}

function formatDayNumber(dateString: string): string {
  const date = parseCalendarDate(dateString);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatFullDate(dateString: string): string {
  const date = parseCalendarDate(dateString);
  if (!date) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getSessionSeats(session: Session) {
  const base = getSeatAvailability(session.spots_available, session.capacity);
  const isWarning = !base.isFull && (base.isLimited || base.available <= 6);
  return {
    ...base,
    visualState: base.isFull ? "full" : isWarning ? "limited" : "open",
  };
}
</script>

<template>
  <article class="course-group" :aria-labelledby="`course-title-${course.id}`">
    <div class="course-group__info panel flow">
      <div class="course-group__top repel">
        <p class="course-group__price">
          <span class="course-group__amount">{{ formattedPrice }}</span>
          <span class="course-group__unit">per person</span>
        </p>
        <span v-if="courseBadge" class="course-group__badge">{{ courseBadge }}</span>
      </div>

      <h2 :id="`course-title-${course.id}`" class="course-group__title">
        {{ course.course_name }}
      </h2>

      <p class="course-group__description">{{ course.description }}</p>

      <dl class="course-group__meta">
        <div class="course-group__meta-row">
          <span class="course-group__meta-icon" aria-hidden="true">
            <AppIcon name="lucide:clock" />
          </span>
          <div class="course-group__meta-copy">
            <dt>Time</dt>
            <dd>{{ primarySession?.time ?? "8:30AM – 2:30PM" }}</dd>
          </div>
        </div>

        <div class="course-group__meta-row">
          <span class="course-group__meta-icon" aria-hidden="true">
            <AppIcon name="lucide:map-pin" />
          </span>
          <div class="course-group__meta-copy">
            <dt>Location</dt>
            <dd>{{ primarySession?.location ?? "St. Mary Baptist Church" }}</dd>
          </div>
        </div>

        <div class="course-group__meta-row">
          <span class="course-group__meta-icon" aria-hidden="true">
            <AppIcon name="lucide:users" />
          </span>
          <div class="course-group__meta-copy">
            <dt>Class size</dt>
            <dd>{{ primarySession?.capacity ?? 20 }} seats per session</dd>
          </div>
        </div>
      </dl>

      <NuxtLink :to="courseDetailsHref" class="course-group__details-link">
        <span>Course details</span>
        <span class="visually-hidden"> for {{ course.course_name }}</span>
        <AppIcon name="lucide:arrow-right" class="course-group__details-icon" />
      </NuxtLink>
    </div>

    <div class="course-group__sessions-panel panel flow">
      <div class="course-group__sessions-header repel">
        <h3 class="course-group__sessions-title">Upcoming sessions</h3>
        <p class="course-group__sessions-count">
          {{ sortedSessions.length }} {{ sortedSessions.length === 1 ? "date" : "dates" }}
        </p>
      </div>

      <ul v-if="visibleSessions.length" class="course-group__sessions u-list-reset" role="list">
        <li
          v-for="session in visibleSessions"
          :key="session.id"
          class="course-session-row"
          :data-state="getSessionSeats(session).visualState"
        >
          <div class="course-session-row__calendar" aria-hidden="true">
            <span class="course-session-row__month-day">{{
              formatMonthWeekday(session.date)
            }}</span>
            <span class="course-session-row__day-num">{{ formatDayNumber(session.date) }}</span>
          </div>

          <div class="course-session-row__body">
            <p class="course-session-row__date">
              <time :datetime="session.date.trim().slice(0, 10)">{{
                formatFullDate(session.date)
              }}</time>
            </p>
            <div class="course-session-row__meter">
              <div
                class="course-session-row__track"
                role="meter"
                aria-label="Session capacity"
                :aria-valuenow="getSessionSeats(session).percentOccupied"
                :aria-valuemin="0"
                :aria-valuemax="100"
                :aria-valuetext="getSessionSeats(session).description"
              >
                <span
                  class="course-session-row__fill"
                  :style="{ inlineSize: `${getSessionSeats(session).percentOccupied}%` }"
                />
              </div>
              <span class="course-session-row__seats-label">{{
                getSessionSeats(session).label
              }}</span>
            </div>
          </div>

          <div class="course-session-row__action">
            <span v-if="getSessionSeats(session).isFull" class="course-session-row__full">
              FULL
            </span>
            <AppButton
              v-else
              :href="getRegistrationHref(session.id)"
              size="small"
              :aria-label="`Register for ${course.course_name} on ${formatFullDate(session.date)}`"
            >
              Register
            </AppButton>
          </div>
        </li>
      </ul>

      <div v-else class="course-group__empty">
        <p>No upcoming dates scheduled right now.</p>
      </div>

      <button
        v-if="hiddenCount > 0"
        type="button"
        class="course-group__more-btn"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? "Show fewer dates"
            : `Show ${hiddenCount} more ${hiddenCount === 1 ? "date" : "dates"}`
        }}
      </button>

      <p class="course-group__stripe-note">
        Secure payment by Stripe. You'll get a receipt by email.
      </p>
    </div>
  </article>
</template>

<style scoped>
@layer blocks {
  .course-group {
    --button-small-height: 2.5rem;
    --button-small-font-size: var(--text-caption);
    --button-weight: var(--fw-regular);
    --button-ring-size: 4px;

    display: grid;
    gap: var(--space-450);
    align-items: start;

    @media (width >= 56em) {
      grid-template-columns: minmax(18rem, 0.78fr) minmax(0, 1.22fr);
    }
  }

  .course-group__info,
  .course-group__sessions-panel {
    --flow-space: var(--space-400);
    padding: var(--space-600);
    border-radius: var(--radius-300);
    box-shadow: var(--shadow-100);
  }

  .course-group__top {
    --repel-align: baseline;
  }

  .course-group__price {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-200);
    color: var(--clr-text);
  }

  .course-group__amount {
    font-size: clamp(2.25rem, 3.5vw, 3rem);
    font-weight: var(--fw-regular);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: var(--tracking-heading);
  }

  .course-group__unit {
    color: var(--clr-text-muted);
    font-size: var(--text-meta);
  }

  .course-group__badge {
    font-family: var(--ff-mono);
    font-size: var(--text-meta);
    color: var(--clr-accent-600);
  }

  .course-group__title {
    color: var(--clr-text);
    font-size: clamp(1.625rem, 2.2vw, 2.125rem);
    font-weight: var(--fw-regular);
    line-height: 1.15;
  }

  .course-group__description {
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
    line-height: var(--lh-base);
  }

  .course-group__meta {
    margin: 0;
    border-block-start: var(--border-width) solid var(--clr-border);
  }

  .course-group__meta-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--space-300);
    padding-block: var(--space-300);
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .course-group__meta-icon {
    --icon-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    border-radius: var(--radius-pill);
    background-color: var(--clr-surface-page);
    color: var(--clr-primary-500);
  }

  .course-group__meta-copy {
    display: grid;
    gap: 0.125rem;
    min-inline-size: 0;

    & dt {
      color: var(--clr-text-muted);
      font-size: 0.75rem;
      line-height: var(--lh-snug);
    }

    & dd {
      margin: 0;
      color: var(--clr-text);
      font-size: var(--text-caption);
      line-height: var(--lh-snug);
    }
  }

  .course-group__details-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    padding-block-start: var(--space-100);
    color: var(--clr-primary-500);
    font-size: var(--text-caption);
    font-weight: var(--fw-regular);
    text-decoration: none;

    &:hover {
      color: var(--clr-primary-600);
      text-decoration: underline;
    }
  }

  .course-group__details-icon {
    --icon-size: 1rem;
  }

  .course-group__sessions-header {
    padding-block-end: var(--space-300);
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .course-group__sessions-title {
    color: var(--clr-text);
    font-size: 1.125rem;
    font-weight: var(--fw-regular);
  }

  .course-group__sessions-count {
    font-family: var(--ff-mono);
    font-size: var(--text-meta);
    color: var(--clr-text-muted);
  }

  .course-group__sessions {
    margin-block-start: 0;
  }

  .course-session-row {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-400);
    padding-block: var(--space-400);
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .course-session-row__calendar {
    display: grid;
    gap: var(--space-100);
  }

  .course-session-row__month-day {
    font-family: var(--ff-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--clr-text-muted);
  }

  .course-session-row__day-num {
    font-size: clamp(1.75rem, 2.4vw, 2.125rem);
    font-weight: var(--fw-regular);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--clr-text);
  }

  .course-session-row__body {
    display: grid;
    gap: var(--space-200);
    min-inline-size: 0;
  }

  .course-session-row__date {
    color: var(--clr-text);
    font-size: var(--text-caption);
    line-height: var(--lh-snug);
  }

  .course-session-row__meter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-300);
  }

  .course-session-row__track {
    inline-size: 6.5rem;
    max-inline-size: 100%;
    block-size: 0.25rem;
    overflow: hidden;
    border-radius: var(--radius-pill);
    background-color: var(--clr-neutral-300);
  }

  .course-session-row__fill {
    display: block;
    block-size: 100%;
    border-radius: inherit;
    background-color: var(--clr-primary-500);
  }

  .course-session-row__seats-label {
    font-size: 0.75rem;
    color: var(--clr-text-muted);
  }

  .course-session-row[data-state="limited"] {
    & .course-session-row__fill {
      background-color: var(--clr-accent-500);
    }

    & .course-session-row__seats-label {
      color: var(--clr-accent-600);
    }
  }

  .course-session-row[data-state="full"] {
    & .course-session-row__month-day,
    & .course-session-row__date,
    & .course-session-row__seats-label {
      color: var(--clr-text-subtle);
    }

    & .course-session-row__day-num {
      color: var(--clr-text-subtle);
      text-decoration: line-through;
    }

    & .course-session-row__fill {
      background-color: var(--clr-neutral-400);
    }
  }

  .course-session-row__full {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius-pill);
    background-color: var(--clr-status-full);
    color: var(--clr-status-full-strong);
    font-family: var(--ff-mono);
    font-size: 0.6875rem;
    line-height: 1;
  }

  .course-group__more-btn {
    justify-self: start;
    min-block-size: 2.25rem;
    padding: var(--space-100) var(--space-400);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    background-color: var(--clr-surface);
    color: var(--clr-text);
    font-size: 0.75rem;
    cursor: pointer;
    transition: border-color var(--duration-fast) var(--ease-standard);

    &:hover {
      border-color: var(--clr-primary-500);
    }
  }

  .course-group__stripe-note {
    color: var(--clr-text-muted);
    font-size: 0.75rem;
  }

  .course-group__empty {
    padding: var(--space-500);
    border-radius: var(--radius-nested);
    background-color: var(--clr-surface-page);
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
    text-align: center;
  }
}
</style>
