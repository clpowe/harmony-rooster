<script setup lang="ts">
withDefaults(defineProps<{ step: number | string; title: string; as?: string }>(), { as: "li" });
</script>

<template>
  <component :is="as" class="step-card flow">
    <p class="step-card__number" aria-hidden="true">{{ step }}</p>
    <h3 class="step-card__title">{{ title }}</h3>
    <p><slot /></p>
  </component>
</template>

<style scoped>
@layer blocks {
  .step-card {
    --flow-space: var(--space-400);
    padding: var(--space-500);
    border-radius: var(--radius-card);
    background: var(--clr-surface-muted);
  }
  .step-card__number {
    color: var(--clr-accent-500);
    font-family: var(--ff-mono);
    font-size: var(--text-numeral);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }
  .step-card__title {
    color: var(--clr-text);
    font-size: var(--text-heading-4);
    font-weight: var(--fw-medium);
  }
}
</style>
