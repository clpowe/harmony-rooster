<script setup lang="ts">
defineProps<{
  id?: string;
}>();
</script>

<template>
  <div class="l-flow">
    <Typography tag="h2" variant="heading-large" :id="id">
      <slot name="title" />
    </Typography>
    <Typography tag="p" variant="body-medium">
      <slot name="description" />
    </Typography>
  </div>
</template>

<style scoped>
div {
  --flow-space: var(--spacing-sm);
}
</style>
