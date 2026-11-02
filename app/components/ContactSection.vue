<template>
  <section id="contact" class="contact-section panel wrapper split">
    <section-header class="contact-section__intro">
      <template #title> Contact <span>Us</span> </template>
      <template #description>Have a question? We’re here to help!</template>
    </section-header>
    <div class="contact-section__form">
      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .contact-section {
    --split-gap: var(--space-layout);
  }

  .contact-section__intro {
    --flow-space: var(--space-400);
    max-inline-size: var(--measure);
  }

  .contact-section__form {
    display: grid;
    min-inline-size: 0;
  }
}
</style>
