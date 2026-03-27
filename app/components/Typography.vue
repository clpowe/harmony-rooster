<script setup lang="ts">
type Variant =
  | "heading"
  | "heading-large"
  | "heading-medium"
  | "heading-small"
  | "text-large"
  | "text"
  | "text-display";

const props = defineProps<{
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  variant: Variant;
  uppercase?: boolean;
  bold?: boolean;
}>();

const VARIANT_CLASSES: Record<Variant, string> = {
  heading: "type type--heading",
  "heading-large": "type type--heading-large",
  "heading-medium": "type type--heading-medium",
  "heading-small": "type type--heading-small",
  "text-large": "type type--text-large",
  text: "type type--text",
  "text-display": "type type--text-display",
};

const variantClass = computed(() => {
  return [
    VARIANT_CLASSES[props.variant],
    props.uppercase ? "type--uppercase" : "",
    props.bold ? "type--bold" : "",
  ]
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

.type--heading {
  font-size: clamp(0.75rem, 5vw, 1.5rem);
  margin-bottom: 0.25rem;
}

.type--heading-large {
  line-break: auto;
  font-size: clamp(2.8rem, 10cqw, 6rem);
  line-height: 1em;

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.type--heading-medium {
  line-break: auto;
  font-size: clamp(2rem, 8cqw, 2.5rem);
  line-height: 0.9em;
  font-weight: 400;
  margin-bottom: var(--space-xxxs);

  :deep(span:first-of-type) {
    color: var(--primary-500);
  }

  :deep(span) {
    color: var(--accent-500);
  }
}

.type--heading-small {
  line-break: auto;
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  line-height: 0.9em;
  font-weight: 400;
}

.type--text-large {
  max-width: 65ch;
  line-height: 140%;
  font-weight: bold;
  font-size: clamp(1.25rem, 10vw, 1.35rem);
}

.type--text {
  max-width: 65ch;
  line-height: 150%;
  font-weight: 100;
  font-size: 1rem;
  text-wrap: balance;
  opacity: 0.7;

  :deep(span) {
    font-weight: bold;
  }
}

.type--text-display {
  font-size: 0.875rem;
  max-width: 28rem;
}

@media (min-width: 768px) {
  .type--text-display {
    font-size: 1.25rem;
    max-width: 32rem;
  }
}

.type--uppercase {
  text-transform: uppercase;
}

.type--bold {
  font-weight: bold;
}
</style>
