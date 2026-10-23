<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value?: string | number;
  href?: string;
  linkLabel?: string;
}>();
</script>

<template>
  <!-- A definition-list group: render this component inside a dl. -->
  <div class="detail-row">
    <dt class="detail-row__label">
      <span class="detail-row__icon" aria-hidden="true"><AppIcon :name="icon" /></span>
      {{ label }}
    </dt>
    <dd class="detail-row__value">
      <slot>{{ value }}</slot>
    </dd>
    <dd v-if="href" class="detail-row__link">
      <AppTextLink :href="href">{{ linkLabel ?? "View details" }}</AppTextLink>
    </dd>
  </div>
</template>

<style scoped>
@layer blocks {
  .detail-row {
    --detail-icon-size: var(--control-size-icon);
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--space-400);
    row-gap: var(--space-100);
    min-inline-size: 0;
    min-block-size: calc(var(--detail-icon-size) + var(--space-400) * 2);
    padding-block: var(--space-400);
    padding-inline-start: calc(var(--detail-icon-size) + var(--space-300));
    border-block-end: var(--border-width) solid var(--clr-border);
  }

  .detail-row__label {
    grid-column: 1;
    align-self: end;
    color: var(--clr-text-muted);
    font-size: var(--text-caption);
    line-height: var(--lh-snug);
  }

  .detail-row__icon {
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: 50%;
    display: grid;
    place-items: center;
    inline-size: var(--detail-icon-size);
    block-size: var(--detail-icon-size);
    border-radius: var(--radius-pill);
    color: var(--clr-primary-500);
    background: var(--clr-primary-100);
    transform: translateY(-50%);
  }

  .detail-row__value {
    grid-column: 1;
    min-inline-size: 0;
    color: var(--clr-text);
    font-size: var(--text-body);
    line-height: var(--lh-body);
    overflow-wrap: anywhere;
  }

  .detail-row__link {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
    font-size: var(--text-small);
  }

  @media (width < 30em) {
    .detail-row {
      grid-template-columns: minmax(0, 1fr);
    }
    .detail-row__link {
      grid-column: 1;
      grid-row: auto;
    }
  }
}
</style>
