<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href?: string;
    variant?: "primary" | "accent" | "secondary" | "inverse" | "ghost";
    size?: "default" | "small" | "large";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "default",
    disabled: false,
    loading: false,
    type: "button",
  },
);

function guardDisabled(event: MouseEvent) {
  if (!props.disabled && !props.loading) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
</script>

<template>
  <component
    :is="href !== undefined ? 'a' : 'button'"
    class="button"
    :href="disabled || loading ? undefined : href"
    :type="href === undefined ? type : undefined"
    :disabled="href === undefined ? disabled || loading : undefined"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :role="href !== undefined && (disabled || loading) ? 'link' : undefined"
    :tabindex="href !== undefined && (disabled || loading) ? -1 : undefined"
    :data-variant="variant"
    :data-size="size"
    :data-loading="loading ? 'true' : undefined"
    @click.capture="guardDisabled"
  >
    <span v-if="loading" class="button-spinner" aria-hidden="true">
      <AppIcon name="lucide:loader-circle" />
    </span>
    <span v-else-if="$slots['icon-start']" class="icon" aria-hidden="true">
      <slot name="icon-start" />
    </span>
    <slot />
    <span v-if="$slots['icon-end']" class="icon" aria-hidden="true">
      <slot name="icon-end" />
    </span>
  </component>
</template>
