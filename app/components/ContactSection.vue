<template>
  <section id="contact" class="contact-section">
    <section-header class="faq-section__intro">
      <template #title> Contact <span>Us</span> </template>
      <template #description> have a question? We’re here to help! </template>
    </section-header>
    <div class="contact-section__form">
      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  --_container-space: calc(23.3125rem + 18rem + 1rem);

  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  align-items: start;
  container-type: inline-size;
  background-color: var(--background-1-light);
  padding: var(--space-md) var(--space-sm);
}

.contact-section__intro {
  --flow-space: var(--space-xs);

  grid-column: span 2;
  max-width: 28rem;

  @container (inline-size > calc(40ch * 2 + 1rem)) {
    grid-column: span 1;
  }
}

.contact-section__form {
  grid-column: span 2;
  display: grid;

  @container (inline-size > calc(40ch * 2 + 1rem)) {
    grid-column: span 1;
  }
}
</style>
