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
@layer blocks {
  .type {
    color: inherit;
  }
  :where(.heading-2xl, .heading-xl, .heading-large, .heading-medium, .heading-small) {
    font-weight: var(--type-weight, var(--fw-regular));
    letter-spacing: var(--tracking-heading);
    line-height: var(--type-leading, var(--lh-heading));
  }
  .heading-2xl {
    font-size: var(--type-size, var(--text-display-xl));
    line-height: 0.94;
    letter-spacing: var(--tracking-display);
  }
  .heading-xl {
    font-size: var(--type-size, var(--text-display-lg));
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }
  .heading-large {
    font-size: var(--type-size, var(--text-heading-1));
    line-height: var(--type-leading, 1);
  }
  .heading-medium {
    font-size: var(--type-size, var(--text-heading-2));
  }
  .heading-small {
    font-size: var(--type-size, var(--text-heading-4));
    font-weight: var(--type-weight, var(--fw-medium));
  }
  :where(.heading-2xl, .heading-xl, .heading-large, .heading-medium, .heading-small) :deep(span) {
    color: var(--clr-accent-500);
  }
  :where(.heading-2xl, .heading-xl, .heading-large, .heading-medium, .heading-small)
    :deep(span:first-of-type) {
    color: var(--clr-primary-500);
  }
  :where(.body-large, .body-medium, .body-small) {
    max-inline-size: var(--measure-readable);
    line-height: var(--lh-body);
  }
  .body-large {
    font-size: var(--text-body-lg);
  }
  .body-medium {
    font-size: var(--text-body);
  }
  .body-small {
    font-size: var(--text-small);
  }
  .uppercase {
    text-transform: var(--type-transform, uppercase);
    letter-spacing: var(--type-tracking, var(--tracking-eyebrow));
  }
  .bold {
    font-weight: var(--fw-semibold);
  }
}
</style>
