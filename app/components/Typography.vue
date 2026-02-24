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
    heading: "heading",
    "heading-large": "heading-large",
    "heading-medium": "heading-medium",
    "heading-small": "heading-small",
    "text-large": "text-large",
    text: "text",
    "text-display": "text-display",
};

const variantClass = computed(() => {
    return [
        VARIANT_CLASSES[props.variant],
        props.uppercase ? "uppercase" : "",
        props.bold ? "bold" : "",
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
.heading {
    font-size: clamp(0.75rem, 5vw, 1.5rem);
    margin-bottom: 0.25rem;
}

.heading-large {
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

.heading-medium {
    line-break: auto;
    font-size: clamp(2rem, 5vw, 2.5rem);
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

.heading-small {
    line-break: auto;
    font-size: clamp(1.5rem, 5vw, 1.75rem);
    line-height: 0.9em;
    font-weight: 400;
}

.text-large {
    max-width: 75ch;
    line-height: 140%;
    font-weight: bold;
    font-size: clamp(1.25rem, 10vw, 1.35rem);
}

.text {
    max-width: 75ch;
    line-height: 150%;
    font-weight: 100;
    font-size: 1rem;
    text-wrap: balance;

    :deep(span) {
        font-weight: bold;
    }
}

.text-display {
    font-size: 0.875rem;
    max-width: 28rem;
}

@media (min-width: 768px) {
    .text-display {
        font-size: 1.25rem;
        max-width: 32rem;
    }
}

.uppercase {
    text-transform: uppercase;
}

.bold {
    font-weight: bold;
}
</style>
