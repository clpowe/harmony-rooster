<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "reka-ui";

const accordionItems = [
  {
    value: "question-1",
    question: "What is hame care?",
    answer: "Yes. It adheres to the WAI-ARIA design pattern.",
  },
  {
    value: "question-2",
    question: "Who is eligible?",
    answer:
      "Yes. It's unstyled by default, giving you freedom over the look and feel.",
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
  <section class="card faq twoCol">
    <div>
      <Typography tag="h2" variant="heading-medium"
        ><span>Frequently</span> Asked
        <span>Questions</span>
      </Typography>
      <p>Find answers to common questions about our services</p>
    </div>
    <div class="accordion">
      <template v-for="item in accordionItems" :key="item.value">
        <div class="detailsColumn">
          <details>
            <summary>
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
summary {
  cursor: pointer;
  padding-block: 1em;
}
/* Chromium / Firefox */
details summary {
  /* Either remove the list style ... */
  list-style: none;

  /* ... or change the `display` property to something else */
  display: flex;
}

/* Webkit */
details summary::-webkit-details-marker {
  display: none;
}

details::details-content {
  overflow: hidden;
  height: 0;
  padding-bottom: 0;
  /* Enable transitioning of `content-visibility` */
  transition:
    padding-bottom 0.3s,
    height 0.3s,
    content-visibility 0.3s;
  transition-behavior: allow-discrete;
}

details[open]::details-content {
  height: auto;
  padding-bottom: 1em;
}
</style>
