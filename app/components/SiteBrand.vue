<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
    ariaLabel?: string;
  }>(),
  {
    to: "/",
    ariaLabel: "Harmony Rooster home",
  },
);
</script>

<template>
  <NuxtLink :to="to" class="site-brand" :aria-label="ariaLabel">
    <SvgoIconRoosterbg class="site-brand__mark" filled :fontControlled="true" aria-hidden="true" />
    <SvgoIconWordmark
      class="site-brand__wordmark"
      filled
      :fontControlled="true"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped>
.site-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--site-brand-gap, 0.55rem);
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.site-brand:focus-visible {
  outline: 3px solid var(--site-brand-focus, var(--primary-400));
  outline-offset: 4px;
}

.site-brand__mark {
  width: var(--site-brand-mark-width, 1.9rem);
  height: var(--site-brand-mark-height, 2.25rem);
  flex: 0 0 auto;
  color: var(--site-brand-mark-color, var(--primary-500));
  fill: currentColor;
}

.site-brand__wordmark {
  width: var(--site-brand-wordmark-width, clamp(9.8rem, 20vw, 12.25rem));
  height: auto;
  flex: 0 1 auto;
}
</style>
