<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string;
    tone?: "default" | "primary";
  }>(),
  {
    as: "section",
  },
);
</script>

<template>
  <component
    :is="as"
    class="panel"
    :data-tone="
      (tone && tone !== 'default' ? tone : undefined) ?? ($attrs['data-tone'] as string | undefined)
    "
  >
    <slot />
  </component>
</template>
