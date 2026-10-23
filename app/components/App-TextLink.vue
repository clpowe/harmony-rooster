<script setup lang="ts">
withDefaults(defineProps<{ href: string; icon?: string }>(), { icon: "lucide:arrow-right" });
</script>

<template>
  <a class="text-link" :href="href"><slot /><AppIcon v-if="icon" :name="icon" /></a>
</template>

<style scoped>
@layer blocks {
  .text-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    min-block-size: var(--touch-target);
    color: var(--clr-primary-500);
    font-size: var(--text-body);
    font-weight: var(--fw-medium);
    text-decoration: none;
  }
  .text-link:hover {
    color: var(--clr-primary-600);
    text-decoration: underline var(--clr-accent-400);
  }
}
</style>
