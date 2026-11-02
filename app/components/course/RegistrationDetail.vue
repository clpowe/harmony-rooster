<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="registration-detail">
    <Icon :name="icon" class="registration-detail__icon" aria-hidden="true" />
    <div class="registration-detail__content flow">
      <Typography tag="p" variant="heading-small" class="registration-detail__label">{{
        label
      }}</Typography>
      <Typography tag="p" variant="body-medium">{{ value }}</Typography>
    </div>
  </div>
</template>

<style scoped>
@layer blocks {
  .registration-detail {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--space-200);
    align-items: start;
  }

  .registration-detail__icon {
    margin-block-start: var(--space-100);
    font-size: var(--text-heading-4);
    color: var(--clr-primary-500);
  }

  .registration-detail__label {
    --type-size: var(--text-caption);
    --type-weight: var(--fw-regular);
    --type-leading: 1.4;
    color: var(--clr-text-muted);
  }

  .registration-detail__content {
    --flow-space: var(--space-100);
  }
}
</style>
