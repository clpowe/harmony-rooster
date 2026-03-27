<script setup lang="ts">
import Care from "@/assets/icons/icon-care.svg";
import Cook from "@/assets/icons/icon-cook.svg";
import Medication from "@/assets/icons/icon-medication.svg";
import Companion from "@/assets/icons/icon-companion.svg";

type Service = {
  icon: typeof Care;
  title: string;
  text: string;
};

const services: Service[] = [
  {
    icon: Care,
    title: "Personal Support",
    text: "Help with daily living, companionship, and light household tasks.",
  },
  {
    icon: Cook,
    title: "Respite",
    text: "Short-term relief care to give primary caregivers a break.",
  },
  {
    icon: Medication,
    title: "Nursing",
    text: "Skilled medical care and health management at home.",
  },
  {
    icon: Companion,
    title: "Foster Home",
    text: "24/7 family-style living with personalized support.",
  },
];
</script>

<template>
  <section
    id="our-services"
    class="services-section u-card u-surface-2"
    aria-labelledby="our-services-title"
  >
    <div class="services-section__intro l-flow">
      <Typography tag="h2" variant="heading-medium" id="our-services-title"
        >Our <span>Services</span></Typography
      >
      <Typography tag="p" variant="text" id="our-services-intro"
        >Harmony Rooster, LLC is here to help. Our team of dedicated and qualified caregivers
        provides a helping hand with a variety of needs, including:</Typography
      >
    </div>

    <ul class="services-grid u-list-reset" aria-describedby="our-services-intro">
      <li v-for="(item, idx) in services" :key="item.title" class="service-card">
        <div class="service-card__header">
          <component
            :is="item.icon"
            class="service-card__icon"
            aria-hidden="true"
            focusable="false"
          />
          <Typography
            tag="h3"
            variant="heading-small"
            :id="`service-title-${idx}`"
            class="service-card__title"
            >{{ item.title }}</Typography
          >
        </div>
        <Typography tag="p" variant="text" :id="`service-desc-${idx}`">{{ item.text }}</Typography>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.services-section {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: 1fr;

  @media (min-width: 1000px) {
    gap: var(--space-xl);
    grid-template-columns: 2fr 3fr;
  }
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);

  @media (min-width: 500px) {
    grid-template-columns: 1fr 1fr;
  }
}

.service-card {
  display: grid;
  background: var(--surface-1);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  gap: var(--space-sm);
}

.service-card__header {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.service-card__title {
  color: var(--primary-500);
}

.service-card__icon {
  font-size: var(--size-8);
  color: var(--primary-500);
  margin: 0;
}
</style>
