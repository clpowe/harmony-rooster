<script setup lang="ts">
useSeoMeta({
  title: "Home Care for Adults with Disabilities in Riverview, FL | Harmony Rooster",
  description:
    "Harmony Rooster provides compassionate in-home care, respite care, companion services, nursing support, and foster home services for individuals with developmental disabilities in Tampa and Hillsborough County, Florida.",
});
</script>

<template>
  <main class="l-container l-flow">
    <HomeHero></HomeHero>
    <our-services />
    <about-us />
    <Courses />
    <FAQSection />
    <ContactSection />
  </main>
</template>

<style scoped>
main > * + * {
  --flow-space: var(--space-sm);

  @media (min-width: 768px) {
    --flow-space: var(--space-xxl);
  }
}
</style>
