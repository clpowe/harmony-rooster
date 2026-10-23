<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "inverse";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
  }>(),
  { type: "button", variant: "primary", disabled: false, loading: false, fullWidth: false },
);
</script>

<template>
  <AppButton
    class="arrow-button"
    :href="href"
    :type="type"
    :variant="variant"
    :disabled="disabled"
    :loading="loading"
    :data-width="fullWidth ? 'full' : undefined"
  >
    <span class="arrow-button__label"><slot /></span>
    <template #icon-end>
      <span class="arrow-button__disc" aria-hidden="true"
        ><AppIcon name="lucide:arrow-right"
      /></span>
    </template>
  </AppButton>
</template>

<style scoped>
@layer blocks {
  .arrow-button {
    --button-height: 4rem;
    min-inline-size: 0;
    justify-content: space-between;
    padding: var(--space-200) var(--space-200) var(--space-200) var(--space-500);
    white-space: normal;
    text-align: start;
    line-height: var(--lh-snug);
  }
  .arrow-button__label {
    min-inline-size: 0;
  }
  .arrow-button__disc {
    --icon-size: 1.25rem;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    inline-size: var(--control-size-icon);
    block-size: var(--control-size-icon);
    border-radius: var(--radius-pill);
    background: var(--clr-surface);
    color: var(--clr-primary-500);
  }
  .arrow-button[data-variant="inverse"] .arrow-button__disc {
    background: var(--clr-primary-500);
    color: var(--clr-neutral-100);
  }
  .arrow-button[aria-disabled="true"] .arrow-button__disc {
    background: transparent;
    color: inherit;
  }
}
</style>
