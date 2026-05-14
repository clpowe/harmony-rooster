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
  <section id="our-services" class="services-section" aria-labelledby="our-services-title">
    <section-header>
      <template #title> Our <span>Services</span> </template>
      <template #description>
        Harmony Rooster, LLC is a locally owned and operated company based in Tampa, Florida. The
        company was founded by Derek and Cynthia Robinson, who are passionate about providing
        exceptional in-home care services that empower individuals to live their best lives.
      </template>
    </section-header>

    <ul class="services-grid u-list-reset" aria-describedby="our-services-intro">
      <li v-for="(item, idx) in services" :key="item.title" class="service-card">
        <component
          :is="item.icon"
          class="service-card__icon"
          aria-hidden="true"
          focusable="false"
        />
        <div class="service-card__header">
          <Typography
            tag="h3"
            variant="heading-small"
            :id="`service-title-${idx}`"
            class="service-card__title"
            >{{ item.title }}</Typography
          >
          <Typography tag="p" variant="text" :id="`service-desc-${idx}`">{{
            item.text
          }}</Typography>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.services-section {
  display: grid;
  gap: var(--space-xl);
  grid-template-columns: 1fr;

  display: grid;
  gap: var(--space-xl);
  padding: var(--space-md) var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--background-1-light);

  @media (min-width: 1000px) {
    gap: var(--space-xl);
    grid-template-columns: 1fr 1fr;
  }
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  container-type: inline-size;

  @container (inline-size > calc(25ch * 2 + 1rem)) {
    grid-template-columns: 1fr 1fr;
  }
}

.service-card {
  display: grid;
  background: var(--background-2-light);
  grid-template-columns: auto 1fr;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  gap: var(--space-sm);
  align-content: flex-start;
  grid-column: span 1;

  @container (inline-size < calc(25ch * 2 + 1rem)) {
    grid-column: span 2;
  }
}

.service-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.service-card__title {
  color: var(--primary-500);
}

.service-card__icon {
  width: var(--text-2xl);
  height: var(--text-2xl);
  color: var(--primary-500);
  margin: 0;
}
</style>
