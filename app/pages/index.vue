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
