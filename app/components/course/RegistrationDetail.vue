<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="registration-detail">
    <Icon :name="icon" class="icon" aria-hidden="true" />
    <div class="content">
      <Typography tag="p" variant="heading-small" class="title">{{ label }}</Typography>
      <Typography tag="p" variant="body-small">{{ value }}</Typography>
    </div>
  </div>
</template>

<style scoped>
.registration-detail {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xs);
  align-items: start;
}

.icon {
  margin-top: 0.15rem;
  font-size: 1.5rem;
  color: var(--text-1);
}

.title {
  font-weight: bold;
}

.content {
  display: grid;
  gap: var(--space-xxs);
}
</style>
