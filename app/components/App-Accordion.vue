<script setup lang="ts">
defineProps<{ question: string; open?: boolean; name?: string }>();
</script>

<template>
  <details class="accordion" :open="open" :name="name">
    <summary class="accordion__summary">
      <h3 class="accordion__question">{{ question }}</h3>
      <span class="accordion__toggle" aria-hidden="true"><AppIcon name="lucide:plus" /></span>
    </summary>
    <div class="accordion__answer flow"><slot /></div>
  </details>
</template>

<style scoped>
@layer blocks {
  .accordion {
    border-block-start: var(--border-width) solid var(--clr-border);
  }
  .accordion__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-400);
    padding-block: var(--space-450);
    cursor: pointer;
    list-style: none;
  }
  .accordion__summary::-webkit-details-marker {
    display: none;
  }
  .accordion__question {
    flex: 1;
    font-size: var(--text-body-lg);
    line-height: var(--lh-snug);
    font-weight: var(--fw-regular);
    letter-spacing: normal;
  }
  .accordion__toggle {
    display: grid;
    place-items: center;
    flex: 0 0 var(--control-size-small);
    inline-size: var(--control-size-small);
    block-size: var(--control-size-small);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    transition:
      transform var(--duration-fast) var(--ease-standard),
      background-color var(--duration-fast) var(--ease-standard);
  }
  .accordion__answer {
    padding-block-end: var(--space-500);
  }
  .accordion[open] .accordion__toggle {
    transform: rotate(45deg);
    color: var(--clr-neutral-100);
    background: var(--clr-primary-500);
    border-color: transparent;
  }
}
</style>
