<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string;
    id?: string;
    title?: string;
    description?: string;
  }>(),
  {
    as: "header",
  },
);
</script>

<template>
  <component :is="as" class="section-header flow">
    <h2 v-if="$slots.title || title" :id="id">
      <slot name="title">{{ title }}</slot>
    </h2>
    <p v-if="$slots.description || description">
      <slot name="description">{{ description }}</slot>
    </p>
    <slot />
  </component>
</template>

<style scoped>
@layer blocks {
  .section-header {
    --flow-space: var(--space-400);
    min-inline-size: 0;
  }

  .section-header > h2 {
    color: var(--clr-primary-500);
  }

  .section-header > p {
    max-inline-size: var(--measure);
    color: var(--clr-text-muted);
    font-size: var(--text-body-lg);
  }
}
</style>
