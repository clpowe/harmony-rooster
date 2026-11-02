<script setup lang="ts">
const credentials = [
  { text: "APD iBudget Waiver provider", icon: "lucide:check" },
  { text: "State-licensed provider", icon: "lucide:shield-check" },
  { text: "Family-owned in Tampa Bay", icon: "lucide:users" },
  { text: "Fully insured", icon: "lucide:shield" },
];
</script>

<template>
  <ul class="trust auto-grid" role="list" aria-label="Credentials">
    <li v-for="credential in credentials" :key="credential.text" class="trust-item cluster">
      <span class="trust-icon" aria-hidden="true">
        <AppIcon :name="credential.icon" />
      </span>
      <span class="trust-text">{{ credential.text }}</span>
    </li>
  </ul>
</template>

<style scoped>
@layer blocks {
  .trust {
    --auto-grid-min: 13rem;

    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--clr-text);
    font-size: var(--text-caption);
    line-height: var(--lh-base);
  }

  .trust-item {
    flex-wrap: nowrap;
  }

  .trust-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    inline-size: var(--space-600);
    block-size: var(--space-600);
    border-radius: var(--radius-pill);
    color: var(--clr-primary-500);
    background-color: var(--clr-primary-100);
  }

  .trust-text {
    min-inline-size: 0;
  }
}
</style>
