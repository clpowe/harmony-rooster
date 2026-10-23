<script setup lang="ts">
type Service = {
  title: string;
  text: string;
  href: string;
  featured?: boolean;
};

const services: Service[] = [
  {
    title: "Personal Support",
    text: "Help with daily living, companionship, and light household tasks.",
    href: "#contact",
  },
  {
    title: "Respite",
    text: "Short-term relief care to give primary caregivers a break.",
    href: "#contact",
  },
  {
    title: "Nursing",
    text: "Skilled medical care and health management at home.",
    href: "#contact",
  },
  {
    title: "Foster Home",
    text: "24/7 family-style living with personalized support.",
    href: "#contact",
    featured: true,
  },
];
</script>

<template>
  <AppPanel id="our-services" class="split wrapper region" aria-labelledby="our-services-title">
    <SectionHeader id="our-services-title">
      <template #title>Our Services</template>
      <template #description>
        Harmony Roosters provides support for individuals with developmental disabilities in the
        Riverview/Brandon area, designed to promote independence, dignity, safety, and meaningful
        participation in daily life.
      </template>
      <AppButton href="https://applynow.apd.myflorida.com/" variant="secondary" size="small">
        Apply for services
        <template #icon-end><AppIcon name="lucide:arrow-right" /></template>
      </AppButton>
    </SectionHeader>

    <ul class="services-grid auto-grid" role="list">
      <li
        v-for="item in services"
        :key="item.title"
        class="service flow"
        :data-featured="item.featured ? 'true' : undefined"
      >
        <h3 class="service-title">{{ item.title }}</h3>
        <p class="service-text">{{ item.text }}</p>
        <a class="service-link" :href="item.href">
          Learn More<span class="visually-hidden"> about {{ item.title }}</span>
        </a>
      </li>
    </ul>
  </AppPanel>
</template>

<style scoped>
@layer blocks {
  .services-grid {
    --auto-grid-min: 13rem;
    --auto-grid-gap: var(--space-450);
  }

  .service {
    --flow-space: var(--space-300);
    padding: var(--space-500);
    background-color: var(--clr-surface-muted);
    border-radius: var(--radius-inner);
  }

  .service-title {
    font-size: var(--text-heading-3);
    font-weight: var(--fw-regular);
    color: var(--clr-primary-500);
  }

  .service-link {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--touch-target);
    color: inherit;
    font-size: var(--text-small);
    text-underline-offset: 0.2em;
  }

  .service-text {
    color: var(--clr-text-muted);
  }

  .service[data-featured="true"] {
    background-color: var(--clr-primary-500);
    color: var(--clr-neutral-100);
  }

  .service[data-featured="true"] :is(.service-title, .service-text) {
    color: inherit;
  }
}
</style>
