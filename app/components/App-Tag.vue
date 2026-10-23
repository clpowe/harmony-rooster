<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "full" | "seats";
    datetime?: string;
    icon?: string;
  }>(),
  {
    variant: "default",
  },
);
</script>

<template>
  <span class="tag" :data-variant="variant">
    <slot name="icon">
      <AppIcon v-if="icon" :name="icon" />
    </slot>
    <time v-if="datetime" :datetime="datetime"><slot /></time>
    <slot v-else />
  </span>
</template>
