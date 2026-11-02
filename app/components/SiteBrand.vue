<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
    ariaLabel?: string;
  }>(),
  {
    to: "/",
    ariaLabel: "Harmony Roosters home",
  },
);
</script>

<template>
  <NuxtLink :to="to" class="site-brand" :aria-label="ariaLabel">
    <!-- <SvgoIconRoosterbg class="site-brand__mark" filled :fontControlled="false" aria-hidden="true" />-->
    <SvgoIconWordmark
      class="site-brand__wordmark"
      filled
      :fontControlled="false"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped>
@layer blocks {
  .site-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--site-brand-gap, var(--space-200));
    min-inline-size: 0;
    color: inherit;
    text-decoration: none;
  }

  .site-brand:focus-visible {
    outline: var(--focus-ring-width) solid var(--site-brand-focus, var(--focus-ring-color));
    outline-offset: var(--focus-ring-offset);
  }

  .site-brand__mark {
    inline-size: var(--site-brand-mark-width, 1.9rem);
    block-size: var(--site-brand-mark-height, 2.25rem);
    flex: 0 0 auto;
    color: var(--site-brand-mark-color, var(--clr-primary-500));
    fill: currentColor;
  }

  .site-brand__wordmark {
    inline-size: var(--site-brand-wordmark-width, clamp(9.8rem, 20vw, 12.25rem));
    block-size: auto;
    flex: 0 1 auto;
  }
}
</style>
