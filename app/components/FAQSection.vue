<script setup lang="ts">
const accordionItems = [
  {
    value: "question-1",
    question: "What is hame care?",
    answer: "Yes. It adheres to the WAI-ARIA design pattern.",
  },
  {
    value: "question-2",
    question: "Who is eligible?",
    answer: "Yes. It's unstyled by default, giving you freedom over the look and feel.",
  },
  {
    value: "question-3",
    question: "How much does it cost?",
    answer: "Yes! You can use the transition prop to configure the animation.",
  },
  {
    value: "question-4",
    question: "Is this covered by medicare?",
    answer: "Yes! You can use the transition prop to configure the animation.",
  },
  {
    value: "question-5",
    question: "Do you take insurance?",
    answer: "Yes! You can use the transition prop to configure the animation.",
  },
];
</script>

<template>
  <section class="faq-section u-card u-surface-2">
    <div class="faq-section__intro l-flow">
      <Typography tag="h2" variant="heading-medium"
        ><span>Frequently</span> Asked
        <span>Questions</span>
      </Typography>
      <p>Find answers to common questions about our services</p>
    </div>
    <div class="faq-section__list">
      <template v-for="item in accordionItems" :key="item.value">
        <div class="faq-section__item">
          <details class="faq-section__details">
            <summary class="faq-section__summary">
              <Typography tag="h3" variant="heading-small">
                {{ item.question }}
              </Typography>
            </summary>
            <Typography tag="p" variant="text">{{ item.answer }}</Typography>
          </details>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.faq-section {
  overflow: hidden;
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  container-type: inline-size;
  background-color: var(--surface-2);
  gap: var(--space-md);
  align-items: center;
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-sm);

  @container (inline-size > calc(25ch * 2 + 1rem)) {
    padding: var(--space-lg) var(--space-md);
  }
}

.faq-section__intro {
  grid-column: span 2;

  @container (inline-size > calc(25ch * 2 + 1rem)) {
    grid-column: span 1;
  }
}

.faq-section__list {
  display: grid;
  gap: var(--space-sm);
  grid-column: span 2;

  @container (inline-size > calc(25ch * 2 + 1rem)) {
    grid-column: span 1;
  }
}

.faq-section__item {
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.faq-section__summary {
  cursor: pointer;
  padding-block: 1em;
}

.faq-section__details summary {
  list-style: none;
  display: flex;
}

.faq-section__details summary::-webkit-details-marker {
  display: none;
}

.faq-section__details::details-content {
  overflow: hidden;
  height: 0;
  padding-bottom: 0;
  transition:
    padding-bottom 0.3s,
    height 0.3s,
    content-visibility 0.3s;
  transition-behavior: allow-discrete;
}

.faq-section__details[open]::details-content {
  height: auto;
  padding-bottom: 1em;
}
</style>
