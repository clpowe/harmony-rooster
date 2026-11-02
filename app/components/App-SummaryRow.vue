<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value?: string | number;
    mono?: boolean;
    /** Colours the value to match AppStatusPill tones. */
    status?: "neutral" | "success" | "pending" | "warning";
  }>(),
  { mono: false, status: "neutral" },
);
</script>

<template>
  <!-- A definition-list group: render this component inside a dl. -->
  <div
    class="summary-row"
    :data-mono="mono || undefined"
    :data-status="status !== 'neutral' ? status : undefined"
  >
    <dt class="summary-row__label">{{ label }}</dt>
    <dd class="summary-row__value">
      <slot>{{ value }}</slot>
    </dd>
  </div>
</template>

<style scoped>
@layer blocks {
  .summary-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
    gap: var(--space-400);
    align-items: baseline;
    padding-block: var(--space-400);
    border-block-start: var(--border-width) solid var(--clr-border);
    font-size: var(--text-body);
    line-height: var(--lh-body);
  }

  .summary-row__label {
    color: var(--clr-text-muted);
  }
  .summary-row__value {
    min-inline-size: 0;
    color: var(--clr-text);
    text-align: end;
    overflow-wrap: anywhere;
  }
}

@layer exceptions {
  .summary-row[data-mono] .summary-row__value {
    font-family: var(--ff-mono);
    font-size: var(--text-caption);
  }

  /* Same text colours AppStatusPill uses per tone. */
  .summary-row[data-status="success"] .summary-row__value {
    color: var(--clr-success-500);
  }
  .summary-row[data-status="pending"] .summary-row__value {
    color: var(--clr-primary-500);
  }
  .summary-row[data-status="warning"] .summary-row__value {
    color: var(--clr-accent-600);
  }
}
</style>
