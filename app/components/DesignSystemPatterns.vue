<script setup lang="ts">
import {
  documentHtml,
  formHtml,
  patternExamples,
  signatureHtml,
  tableHtml,
} from "@/design-system/patterns";

defineProps<{ printOnly?: boolean }>();
const formSaved = ref(false);
const print = () => window.print();
</script>

<template>
  <div v-if="printOnly" class="print-preview flow">
    <div class="document-page__print-action cluster">
      <AppButton @click="print">Print or save as PDF</AppButton>
      <a href="/design-system#ds-document">Back to the design system</a>
    </div>
    <div v-html="documentHtml" />
  </div>
  <div v-else class="flow">
    <h2 id="ds-new-patterns" class="ds-heading">Table, form and print</h2>
    <section class="ds-specimen flow" aria-labelledby="ds-data-table-title">
      <h3 id="ds-data-table-title" class="ds-heading">Data table</h3>
      <p>
        Use a muted header, white rows without striping, and a 1px rule below each row. Cells use
        12px × 16px padding. Use 14px header and 15px body type. Align labels to the start and
        numeric columns to the end with tabular figures.
      </p>
      <div v-html="tableHtml" />
      <DesignSystemCode title="Data table HTML + CSS" :code="patternExamples.table" />
    </section>

    <section class="ds-specimen flow" aria-labelledby="ds-form-layout-title">
      <h3 id="ds-form-layout-title" class="ds-heading">Form layout</h3>
      <p>
        Group related controls in a fieldset with a 20px, weight-500 legend. Use a 20px gap between
        groups, 16px between columns and 8px within a field. Put 15px, weight-500 labels above their
        controls and 14px helper text beneath. Link helper and error text to the control by ID.
        Field geometry and focus match the shared text input.
      </p>
      <div @submit.prevent="formSaved = true" v-html="formHtml" />
      <p v-if="formSaved" role="status">Sample saved.</p>
      <DesignSystemCode title="Grouped form HTML + CSS" :code="patternExamples.form" />
    </section>

    <section id="ds-document" class="ds-specimen flow" aria-labelledby="ds-document-title">
      <h3 id="ds-document-title" class="ds-heading">Printable document</h3>
      <p>
        Use US Letter portrait with 0.65in margins. Set the header in teal with white ink, 16px
        padding and a 4px amber lower rule. Use 1px neutral section rules and 1px muted writing
        rules. Print on white without surface shadows, and keep the header and signature groups
        together.
      </p>
      <div v-html="documentHtml" />
      <a
        class="button"
        data-variant="secondary"
        href="/design-system?print=sample"
        data-print-link
        target="_blank"
        rel="noopener"
        >Open printable sample</a
      >
      <DesignSystemCode title="Printable document HTML + CSS" :code="patternExamples.document" />
    </section>

    <section class="ds-specimen flow" aria-labelledby="ds-signature-title">
      <h3 id="ds-signature-title" class="ds-heading">Signature and line fields</h3>
      <p>
        Give each field a 44px writing area and a square-cornered 1px bottom rule. Place its 14px,
        weight-500 label 4px below. Use a 24px gap between fields. On screen, the 3px teal keyboard
        outline sits 2px outside the input. On paper, use the blank writing rule shown in the
        document.
      </p>
      <div v-html="signatureHtml" />
      <DesignSystemCode title="Signature HTML + CSS" :code="patternExamples.signature" />
    </section>
  </div>
</template>

<style src="../design-system/patterns.css"></style>
<style src="../design-system/document.css"></style>
<style scoped>
@layer blocks {
  .ds-heading {
    color: var(--clr-text);
    font-size: var(--text-heading-4);
    font-weight: var(--fw-medium);
    line-height: var(--lh-snug);
  }

  .print-preview {
    padding: var(--space-500);
  }

  .document-page__print-action {
    justify-content: center;
  }

  @media print {
    .print-preview {
      padding: 0;
    }

    .print-preview > div {
      margin: 0;
    }
  }
}
</style>
