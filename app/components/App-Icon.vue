<script setup lang="ts">
defineProps<{
  name: string;
  label?: string;
}>();
</script>

<template>
  <Icon
    :name="name"
    mode="svg"
    class="icon"
    size="var(--icon-size, 1.25em)"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
  />
</template>

<style scoped>
@layer blocks {
  .icon {
    inline-size: var(--icon-size, 1.25em);
    block-size: var(--icon-size, 1.25em);
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
