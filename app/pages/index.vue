<script setup>
import RoosterBG from "@/assets/images/roosterbg.svg";
</script>

<template>
  <main class="l-container l-flow">
    <HomeHero></HomeHero>
    <our-services />
    <about-us />
    <Courses />
    <FAQSection />

    <section id="contact" class="contact-panel u-card u-surface-2">
      <div class="contact-panel__content l-flow">
        <Typography tag="h2" variant="heading-medium">Contact <span>Us</span> </Typography>
        <Typography tag="p" variant="text">have a question? We’re here to help!</Typography>
      </div>
      <ContactForm />
    </section>
  </main>
</template>

<style scoped>
main > * + * {
  --flow-space: var(--space-sm);

  @media (min-width: 768px) {
    --flow-space: var(--space-lg);
  }
}

.contact-panel {
  display: grid;
  gap: var(--space-lg);
}

@media (min-width: 768px) {
  .contact-panel {
    grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
    align-items: start;
  }
}
</style>
