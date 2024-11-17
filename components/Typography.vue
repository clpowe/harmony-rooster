<script setup lang="ts">
type Variant =
	| 'heading'
	| 'heading-large'
	| 'heading-small'
	| 'text' | 'text-display'

const props = defineProps<{
	tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
	variant: Variant
}>()

const VARIANT_CLASSES: Record<Variant, string> = {
	heading: 'heading',
	'heading-variable': 'heading-variable',
	'heading-large': 'heading-large',
	'heading-small': 'heading-small',
	text: 'text',
	'text-display': 'text-display'
}

const variantClass = computed(() => {
	return VARIANT_CLASSES[props.variant]
})
</script>
<template>
	<component :is="tag" :class="variantClass">
		<slot />
	</component>
</template>

<style scoped>
.heading {
	font-size: clamp(.75rem, 5vw, 1.5rem);
	margin-bottom: .25rem;
	text-transform: uppercase;
}

.heading-large {
	line-break: auto;
	font-size: clamp(2rem, 10cqw, 6rem);
	text-transform: uppercase;
	line-height: .9em;

	:deep(span:first-of-type) {
		color: var(--primary-500);
	}

	:deep(span) {
		color: var(--accent-500);
	}
}

.text {
	max-width: 75ch;
	line-height: 140%;
	color: var(--text-1);
	font-weight: 100;
	color: #8a8a8a;
	font-size: clamp(.875rem, 10vw, 1rem);
}


.text-display {
	font-size: .875rem;
	max-width: 28rem;
}

@media (min-width: 768px) {
	.text-display {
		font-size: 1.25rem;
		max-width: 32rem;
	}
}
</style>
