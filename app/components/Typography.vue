<script setup lang="ts">
type Variant =
  | "heading-2xl"
  | "heading-xl"
  | "heading-large"
  | "heading-medium"
  | "heading-small"
  | "body-large"
  | "body-medium"
  | "body-small";

const {
  tag = "p",
  variant = "body-medium",
  uppercase = false,
  bold = false,
} = defineProps<{
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  variant: Variant;
  uppercase?: boolean;
  bold?: boolean;
}>();

const VARIANT_CLASSES: Record<Variant, string> = {
  "heading-2xl": "type heading-2xl",
  "heading-xl": "type heading-xl",
  "heading-large": "type heading-large",
  "heading-medium": "type heading-medium",
  "heading-small": "type heading-small",
  "body-large": "type body-large",
  "body-medium": "type body-medium",
  "body-small": "type body-small",
};

const variantClass = computed((): string => {
  return [VARIANT_CLASSES[variant], uppercase ? "uppercase" : "", bold ? "bold" : ""]
    .filter(Boolean)
    .join(" ");
});
</script>
<template>
  <component :is="tag" :class="variantClass">
    <slot />
  </component>
</template>

<style scoped>
.type {
  color: inherit;
}

.heading-2xl {
  font-size: var(--text-5xl);
  line-height: 1em;

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.heading-large {
  line-break: auto;
  font-size: var(--text-4xl);
  line-height: 1em;

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.heading-medium {
  line-break: auto;
  font-size: var(--text-3xl);
  line-height: 0.9em;
  font-weight: 400;

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.heading-small {
  line-break: auto;
  font-size: var(--text-lg);
  line-height: 0.9em;
  font-weight: 400;

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.body-large {
  max-width: 65ch;
  line-height: 120%;
  font-size: var(--text-lg);
  text-wrap: balance;
}

.bodv-medium {
  max-width: 65ch;
  line-height: 120%;
  font-size: var(--text-md);
  text-wrap: balance;
}

.body-small {
  font-size: var(--text-sm);
}

.uppercase {
  text-transform: uppercase;
}

.bold {
  font-weight: bold;
}
</style>
