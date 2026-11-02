<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    tone?: "success" | "pending" | "warning" | "neutral";
    busy?: boolean;
  }>(),
  { tone: "neutral", busy: false },
);

const icon = computed(() => {
  if (props.busy) return "lucide:loader-circle";
  if (props.tone === "success") return "lucide:badge-check";
  if (props.tone === "warning") return "lucide:circle-alert";
  return "lucide:info";
});
</script>

<template>
  <span class="status-pill" :data-tone="tone" :data-busy="busy || undefined">
    <AppIcon :name="icon" class="status-pill__icon" />
    <span>{{ label }}</span>
  </span>
</template>

<style scoped>
@layer blocks {
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    max-inline-size: 100%;
    padding: var(--space-200) var(--space-300);
    border-radius: var(--radius-pill);
    color: var(--clr-primary-500);
    background: var(--clr-primary-100);
    font-size: var(--text-caption);
    line-height: var(--lh-snug);
  }

  .status-pill__icon {
    --icon-size: 1em;
  }
}

@layer exceptions {
  .status-pill[data-tone="success"] {
    color: var(--clr-success-500);
    background: color-mix(in srgb, var(--clr-success-500) 12%, var(--clr-surface));
  }

  .status-pill[data-tone="warning"] {
    color: var(--clr-accent-600);
    background: color-mix(in srgb, var(--clr-accent-400) 12%, var(--clr-surface));
  }

  .status-pill[data-busy] .status-pill__icon {
    animation: status-pill-spin calc(var(--duration-base) * 4) linear infinite;
  }

  @keyframes status-pill-spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-pill[data-busy] .status-pill__icon {
      animation: none;
    }
  }
}
</style>
