<script setup lang="ts">
import type { ReceiptStatus } from "@utils/receipt-status";

withDefaults(
  defineProps<{
    title: string;
    message?: string;
    receiptId?: string;
    status: ReceiptStatus;
    titleId?: string;
    headingTag?: "h1" | "h2" | "h3";
  }>(),
  { titleId: "receipt-title", headingTag: "h1" },
);
</script>

<template>
  <header class="receipt-header">
    <div class="receipt-header__rule" aria-hidden="true"></div>
    <div class="receipt-header__content flow">
      <div class="receipt-header__meta repel">
        <AppStatusPill v-bind="status" />
        <p v-if="receiptId" class="receipt-header__id">Receipt {{ receiptId }}</p>
      </div>
      <component :is="headingTag" :id="titleId" class="receipt-header__title">{{
        title
      }}</component>
      <p v-if="message" class="receipt-header__message">{{ message }}</p>
    </div>
  </header>
</template>

<style scoped>
@layer blocks {
  .receipt-header__rule {
    block-size: var(--space-200);
    background: linear-gradient(
      90deg,
      var(--clr-primary-500) 0 75%,
      var(--clr-accent-500) 75% 100%
    );
  }

  .receipt-header__content {
    --flow-space: var(--space-450);
    padding: var(--space-panel);
  }

  .receipt-header__meta {
    --repel-gap: var(--space-300);
  }
  .receipt-header__id {
    color: var(--clr-text-muted);
    font-family: var(--ff-mono);
    font-size: var(--text-caption);
    overflow-wrap: anywhere;
  }

  .receipt-header__title {
    color: var(--clr-text);
    font-size: var(--text-display-md);
    font-weight: var(--fw-regular);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }

  .receipt-header__message {
    max-inline-size: var(--measure-readable);
    color: var(--clr-text-muted);
    font-size: var(--text-body-lg);
    line-height: var(--lh-body);
  }
}
</style>
