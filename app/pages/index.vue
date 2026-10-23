<script setup lang="ts">
useSeoMeta({
  title: "Home Care for Adults with Disabilities in Riverview/Brandon, FL",
  description:
    "Harmony Roosters provides compassionate in-home care, respite care, companion services, nursing support, and foster home services for individuals with developmental disabilities in the Riverview/Brandon area of Hillsborough County, Florida.",
});
</script>

<template>
  <main class="home-page flow">
    <new-hero></new-hero>
    <our-services />
    <about-us />
    <Courses />
    <FAQSection />
    <ApplyBand />
  </main>
</template>

<style scoped>
@layer blocks {
  .home-page {
    --flow-space: var(--space-section);
  }
}
</style>
