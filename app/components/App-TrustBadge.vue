<script setup lang="ts">
defineProps<{ icon: string }>();
</script>

<template>
  <span class="trust-badge"
    ><span class="trust-badge__disc" aria-hidden="true"><AppIcon :name="icon" /></span
    ><span><slot /></span
  ></span>
</template>

<style scoped>
@layer blocks {
  .trust-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-300);
    color: var(--clr-text);
    font-size: var(--text-small);
  }
  .trust-badge__disc {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    inline-size: var(--control-size-icon);
    block-size: var(--control-size-icon);
    border-radius: var(--radius-pill);
    background: var(--clr-primary-100);
    color: var(--clr-primary-500);
  }
}
</style>
