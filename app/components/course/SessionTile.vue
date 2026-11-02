<script setup lang="ts">
import type { Session } from "@types/courses";
import { getSeatAvailability } from "@utils/seatAvailability";

const props = withDefaults(
  defineProps<{
    session: Session;
    name: string;
    selectedVariant?: "tint" | "solid";
    disabled?: boolean;
  }>(),
  { selectedVariant: "solid", disabled: false },
);
const model = defineModel<string>();
const seats = computed(() =>
  getSeatAvailability(props.session.spots_available, props.session.capacity),
);
const date = computed(() => {
  const normalized = props.session.date.trim().slice(0, 10);
  const value = new Date(`${normalized}T12:00:00.000Z`);
  return Number.isNaN(value.getTime()) ? undefined : value;
});
const dateLabel = computed(() =>
  date.value
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" }).format(date.value)
    : "Date pending",
);
const monthAndWeekday = computed(() =>
  date.value
    ? new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date.value) +
      " · " +
      new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date.value)
    : "Date pending",
);
const day = computed(() => (date.value ? String(date.value.getUTCDate()) : "—"));
const state = computed(() =>
  seats.value.isFull ? "full" : model.value === props.session.id ? "selected" : "available",
);

function revealFocusedTile(event: FocusEvent) {
  const input = event.target as HTMLInputElement;
  input.closest("label")?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
</script>

<template>
  <label class="session-tile" :data-state="state" :data-selected-variant="selectedVariant">
    <input
      class="visually-hidden"
      type="radio"
      :name="name"
      :value="session.id"
      :checked="model === session.id"
      :disabled="disabled || seats.isFull"
      :aria-label="`${dateLabel}, ${session.time}, ${seats.isFull ? 'session full' : seats.label}`"
      @change="model = session.id"
      @focus="revealFocusedTile"
    />
    <span class="session-tile__content" aria-hidden="true">
      <span class="session-tile__month">{{ monthAndWeekday }}</span>
      <span class="session-tile__day">{{ day }}</span>
      <AppSeatMeter
        :available="session.spots_available"
        :capacity="session.capacity"
        :show-label="false"
      />
      <span class="session-tile__availability">
        <span v-if="seats.isFull" class="session-tile__full-pill">FULL</span>
        <span v-else>{{ seats.label }}</span>
      </span>
    </span>
  </label>
</template>

<style scoped>
@layer blocks {
  .session-tile {
    --seat-meter-color: var(--clr-neutral-600);
    --seat-meter-track: var(--clr-neutral-300);

    position: relative;
    display: block;
    min-inline-size: 0;
    padding: var(--space-400);
    border: var(--border-width) solid transparent;
    border-radius: var(--radius-300);
    background-color: var(--clr-surface);
    box-shadow: var(--shadow-100);
    color: var(--clr-text);
    cursor: pointer;
    scroll-snap-align: start;
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      background-color var(--duration-fast) var(--ease-standard),
      color var(--duration-fast) var(--ease-standard);
  }

  .session-tile__content {
    display: grid;
    gap: var(--space-200);
  }

  .session-tile__month {
    font-family: var(--ff-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    line-height: var(--lh-snug);
    text-transform: uppercase;
    color: var(--clr-text-muted);
  }

  .session-tile__day {
    font-size: clamp(2rem, 3vw, 2.5rem);
    font-weight: var(--fw-regular);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: var(--tracking-display);
    margin-block-end: var(--space-100);
  }

  .session-tile__availability {
    display: flex;
    align-items: center;
    min-block-size: 1.25rem;
    font-size: 0.75rem;
    line-height: var(--lh-snug);
    color: var(--clr-text-muted);
  }

  .session-tile__full-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.1875rem 0.5rem;
    border-radius: var(--radius-pill);
    background-color: var(--clr-status-full);
    color: var(--clr-status-full-strong);
    font-family: var(--ff-mono);
    font-size: 0.625rem;
    line-height: 1;
  }

  .session-tile:has(input:focus-visible) {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (hover: hover) {
    .session-tile:has(input:enabled):hover {
      border-color: var(--clr-primary-500);
    }
  }
}

@layer exceptions {
  .session-tile[data-state="selected"] {
    background-color: var(--clr-primary-100);
    border-color: var(--clr-primary-500);
  }

  .session-tile[data-state="selected"][data-selected-variant="solid"] {
    --seat-meter-color: var(--clr-accent-400);
    --seat-meter-track: color-mix(in oklch, var(--clr-neutral-100) 25%, transparent);
    color: var(--clr-neutral-100);
    background-color: var(--clr-primary-500);
    border-color: var(--clr-primary-500);

    & .session-tile__month,
    & .session-tile__availability {
      color: var(--clr-neutral-100);
    }
  }

  .session-tile:has(input:disabled) {
    cursor: not-allowed;
  }

  .session-tile[data-state="full"] {
    --seat-meter-color: var(--clr-neutral-400);
    background-color: color-mix(in oklch, var(--clr-surface) 65%, var(--clr-surface-page));
    box-shadow: none;
    color: var(--clr-text-subtle);

    & .session-tile__month {
      color: var(--clr-text-subtle);
    }

    & .session-tile__day {
      color: var(--clr-text-subtle);
      text-decoration: line-through;
      text-decoration-thickness: 2px;
    }
  }
}
</style>
