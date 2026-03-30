<script setup lang="ts">
import Typography from "./Typography.vue";

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
      <Typography tag="h2" variant="heading-large"
        ><span>Frequently</span> Asked
        <span>Questions</span>
      </Typography>
      <Typography tag="p" variant="body-medium">
        Find answers to common questions about our services
      </Typography>
    </div>
    <div class="faq-section__list">
      <template v-for="item in accordionItems" :key="item.value">
        <div class="faq-section__item">
          <details class="faq-section__details">
            <summary class="faq-section__summary">
              <Typography tag="h3" variant="heading-small">
                {{ item.question }}
              </Typography>
              <span class="faq-section__toggle" aria-hidden="true"></span>
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
  background-color: var(--background-1-light);
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
  padding: var(--space-sm);
  background-color: var(--background-2-light);
  border-radius: var(--radius-sm);
}

.faq-section__summary {
  cursor: pointer;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-sm);
  padding-block: 1em;
}

.faq-section__details summary {
  list-style: none;
}

.faq-section__details summary::-webkit-details-marker {
  display: none;
}

.faq-section__summary :deep(.type--heading-small) {
  flex: 1;
}

.faq-section__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  color: var(--accent-500);
  font-size: 1.25rem;
  line-height: 1;
  font-weight: 400;
}

.faq-section__toggle::before {
  content: "+";
}

.faq-section__details[open] .faq-section__toggle::before {
  content: "−";
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
