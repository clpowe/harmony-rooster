<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    icon: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  { disabled: false, type: "button" },
);
</script>

<template>
  <AppButton
    class="icon-button"
    variant="ghost"
    :type="type"
    :disabled="disabled"
    :aria-label="label"
  >
    <AppIcon :name="icon" />
  </AppButton>
</template>

<style scoped>
@layer blocks {
  .icon-button {
    --button-height: var(--control-size-icon);
    inline-size: var(--control-size-icon);
    flex-shrink: 0;
    padding: 0;
    border-radius: var(--radius-pill);
  }
}
</style>
