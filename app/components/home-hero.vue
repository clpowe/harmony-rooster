<script setup lang="ts">
import Rooster from "@/assets/icons/icon-rooster.svg";
</script>

<template>
  <new-hero></new-hero>
  <section class="hero">
    <div class="hero__body">
      <Typography tag="h1" variant="heading-small" uppercase class=""
        >Home Care & Residential Habilitation in Riverview/Brandon</Typography
      >
      <Typography tag="h2" uppercase variant="heading-2xl">
        Care you can
        <span>Trust</span>
      </Typography>
    </div>
    <div class="hero__lede">
      <Typography tag="p" variant="body-medium"
        >We offer compassionate, non-emergency in-home care services designed to promote
        independence, dignity, and overall well-being.</Typography
      >
      <div class="hero__actions">
        <NuxtLink
          class="button"
          data-size="large"
          data-variant="primary"
          to="https://applynow.apd.myflorida.com/"
        >
          Apply For Services
        </NuxtLink>
        <NuxtLink class="button" data-size="large" data-variant="secondary" to="/#contact">
          Contact us
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .hero {
    display: grid;
    position: relative;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-600);
    margin-block: var(--space-700) var(--space-800);
    color: var(--clr-text);
  }

  .hero__body {
    display: grid;
    gap: var(--space-300);
    max-inline-size: 90ch;
  }

  .hero__body :deep(h1) {
    font-size: var(--text-eyebrow);
    line-height: var(--lh-body);
    font-weight: var(--fw-regular);
    letter-spacing: var(--tracking-eyebrow);
  }

  .hero__body :deep(h2) {
    font-size: var(--text-display-lg);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }

  .hero__lede {
    display: grid;
    gap: var(--space-500);
    justify-items: start;
    color: var(--clr-text-muted);
  }

  .hero__lede :deep(p) {
    max-inline-size: var(--measure);
    font-size: var(--text-lede);
    font-style: italic;
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-300);
  }

  @media (width >= 48em) {
    .hero__lede {
      margin-inline-start: 50%;
    }
  }
}
</style>
