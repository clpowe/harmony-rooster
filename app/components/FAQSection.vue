<script setup lang="ts">
import Typography from "./Typography.vue";

const accordionItems = [
  {
    value: "question-1",
    question: "What services does Harmony Rooster provide?",
    answer:
      "Harmony Rooster is a licensed foster home and home care provider serving individuals with developmental disabilities in the Riverview/Brandon area of Hillsborough County. We provide Residential Habilitation (ResHab) services through the APD iBudget Waiver program, including support with daily living, personal care, medication reminders, community integration, and skilled overnight care for consumers with complex medical needs.",
  },
  {
    value: "question-2",
    question: "What is the APD iBudget Waiver, and do you accept it?",
    answer:
      "The APD iBudget Waiver is a Florida Medicaid program administered by the Agency for Persons with Disabilities that funds services for individuals with developmental disabilities. Harmony Rooster is an enrolled iBudget Waiver provider, and we currently accept new consumers whose services are funded through the waiver.",
  },
  {
    value: "question-3",
    question: "Who can benefit from your services?",
    answer:
      "Our services are designed for individuals with developmental disabilities who need support with daily living, whether in a licensed foster home setting or through in-home Residential Habilitation. This includes consumers with complex medical needs such as tracheostomy care, supplemental oxygen, or CPAP therapy.",
  },
  {
    value: "question-4",
    question: "How do you create a care plan?",
    answer:
      "Every consumer’s plan starts with an assessment of their needs, routines, medical requirements, and goals, developed in coordination with the consumer’s support coordinator and APD guidelines. Plans are documented daily and adjusted as needs change, with regular progress notes and required APD compliance documentation.",
  },
  {
    value: "question-5",
    question: "Are your caregivers screened and trained?",
    answer:
      "Yes. All direct care staff complete Level 2 background screening as required by APD and the state of Florida, along with training specific to each consumer’s care needs, including specialized training for medical equipment such as tracheostomies and oxygen support when applicable.",
  },
  {
    value: "question-6",
    question: "What is a licensed foster home, and how is it different from a group home?",
    answer:
      "A licensed foster home provides a family-style living environment for individuals with developmental disabilities, licensed and monitored by APD. It differs from larger group home settings in that it typically serves fewer individuals in a more home-like setting, with regular oversight from APD’s Residential Licensing and Monitoring team.",
  },
  {
    value: "question-7",
    question: "How often can a caregiver or direct care staff visit?",
    answer:
      "Scheduling depends on each consumer’s approved iBudget Waiver services and support plan, ranging from scheduled Residential Habilitation shifts to overnight skilled nursing support. Contact us to discuss availability based on your loved one’s specific waiver allocation.",
  },
  {
    value: "question-8",
    question: "Do you accept Medicare or private insurance?",
    answer:
      "No. Harmony Rooster is not a Medicare-certified home health agency and does not bill private insurance. Our services are funded through the APD iBudget Waiver and coordinated through Sunshine Health and AHCA/FLMMIS enrollment.",
  },
  {
    value: "question-9",
    question: "How much does care cost?",
    answer:
      "Services are funded through each consumer’s approved APD iBudget Waiver allocation rather than private hourly billing. There is no out-of-pocket cost to eligible waiver consumers for authorized services. Contact us to discuss your loved one’s waiver budget and how our services fit within it.",
  },
  {
    value: "question-10",
    question: "What areas do you serve?",
    answer:
      "We serve the Riverview and Brandon area of Hillsborough County, Florida. Contact our team to confirm availability for your specific location.",
  },
  {
    value: "question-11",
    question: "How do I get started with Harmony Rooster?",
    answer:
      "If your loved one already has an approved iBudget Waiver and a support coordinator, we can begin the enrollment process directly. If you’re new to the waiver, we can help point you toward APD’s application process and answer questions about how our services work once approved.",
  },
];
</script>

<template>
  <section class="faq-section">
    <section-header class="faq-section__intro">
      <template #title>
        <span>Frequently</span> Asked
        <span>Questions</span>
      </template>
      <template #description> Find answers to common questions about our services </template>
    </section-header>
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
  --_container-space: calc(40ch * 2 + 1rem);

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

  @container (inline-size > calc(40ch * 2 + 1rem)) {
    padding: var(--space-lg) var(--space-md);
  }
}

.faq-section__intro {
  --flow-space: var(--spacing-sm);

  place-self: start;
  grid-column: span 2;

  @container (inline-size > calc(40ch * 2 + 1rem)) {
    grid-column: span 1;
  }
}

.faq-section__list {
  display: grid;
  gap: var(--space-sm);
  grid-column: span 2;

  @container (inline-size > calc(40ch * 2 + 1rem)) {
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
