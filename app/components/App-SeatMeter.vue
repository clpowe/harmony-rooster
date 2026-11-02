<script setup lang="ts">
import { getSeatAvailability } from "@utils/seatAvailability";

const props = withDefaults(
  defineProps<{
    available: number;
    capacity: number;
    showLabel?: boolean;
  }>(),
  { showLabel: true },
);

const seats = computed(() => getSeatAvailability(props.available, props.capacity));
</script>

<template>
  <div class="seat-meter" :data-state="seats.state">
    <div
      class="seat-meter__track"
      role="meter"
      aria-label="Session capacity"
      :aria-valuenow="seats.percentOccupied"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuetext="seats.description"
    >
      <span class="seat-meter__fill" :style="{ inlineSize: `${seats.percentOccupied}%` }" />
    </div>
    <span v-if="showLabel" class="seat-meter__label">{{ seats.label }}</span>
  </div>
</template>

<style scoped>
@layer blocks {
  .seat-meter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-300);
    min-inline-size: 0;
  }

  .seat-meter__track {
    flex: 1 1 5rem;
    min-inline-size: 3rem;
    block-size: 0.375rem;
    overflow: hidden;
    border-radius: var(--radius-pill);
    background: var(--seat-meter-track, var(--clr-neutral-300));
  }

  .seat-meter__fill {
    display: block;
    block-size: 100%;
    border-radius: inherit;
    background: var(--seat-meter-color, var(--clr-primary-500));
  }

  .seat-meter__label {
    color: var(--seat-meter-label, var(--clr-text-muted));
    font-size: var(--text-caption);
    line-height: var(--lh-snug);
  }
}

@layer exceptions {
  .seat-meter[data-state="limited"] {
    --seat-meter-color: var(--clr-accent-500);
    --seat-meter-label: var(--clr-accent-600);
  }

  .seat-meter[data-state="full"] {
    --seat-meter-color: var(--clr-neutral-500);
    --seat-meter-label: var(--clr-text-subtle);
  }
}
</style>
