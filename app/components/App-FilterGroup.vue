<script setup lang="ts">
import type { CourseFilterOption } from "@utils/course-filters";

withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    options: readonly CourseFilterOption[];
    tone?: "solid" | "tint";
  }>(),
  { tone: "solid" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <fieldset class="filter-group" :data-tone="tone">
    <legend class="filter-group__label">{{ label }}</legend>
    <div class="filter-group__options">
      <button
        v-for="option in options"
        :key="option.value"
        class="filter-group__chip"
        type="button"
        :aria-pressed="modelValue === option.value"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
@layer blocks {
  .filter-group {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .filter-group__label {
    padding: 0;
    margin-block-end: var(--space-200);
    font-size: var(--text-small);
    font-weight: var(--fw-medium);
  }

  .filter-group__options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-300);
  }

  .filter-group__chip {
    min-block-size: var(--touch-target);
    padding: var(--space-200) var(--space-450);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--clr-text);
    font-size: var(--text-body);
    font-weight: var(--fw-medium);
    line-height: var(--lh-snug);
    text-align: center;
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      background-color var(--duration-fast) var(--ease-standard),
      color var(--duration-fast) var(--ease-standard);
  }

  .filter-group__chip[aria-pressed="true"] {
    border-color: var(--clr-primary-500);
    background: var(--clr-primary-500);
    color: var(--clr-neutral-100);
  }

  .filter-group[data-tone="tint"] .filter-group__chip {
    font-size: var(--text-small);
    padding-inline: var(--space-400);
  }

  .filter-group[data-tone="tint"] .filter-group__chip[aria-pressed="true"] {
    background: var(--clr-primary-100);
    color: var(--clr-primary-500);
  }

  @media (hover: hover) {
    .filter-group__chip:hover {
      border-color: var(--clr-primary-500);
    }
  }
}
</style>
