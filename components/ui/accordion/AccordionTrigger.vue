<script setup lang="ts">
	import { type HTMLAttributes, computed } from 'vue'
	import {
		AccordionHeader,
		AccordionTrigger,
		type AccordionTriggerProps
	} from 'radix-vue'
	import { PlusIcon, MinusIcon } from '@radix-icons/vue'
	import { cn } from '@/lib/utils'

	const props = defineProps<
		AccordionTriggerProps & { class?: HTMLAttributes['class'] }
	>()

	const delegatedProps = computed(() => {
		const { class: _, ...delegated } = props

		return delegated
	})
</script>

<template>
	<AccordionHeader class="flex">
		<AccordionTrigger
			v-bind="delegatedProps"
			:class="
				cn(
					'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
					props.class
				)
			"
		>
			<slot />
			<slot name="icon">
				<PlusIcon
					class="h-6 w-6 shrink-0 text-accent transition-transform duration-200"
				/>
			</slot>
		</AccordionTrigger>
	</AccordionHeader>
</template>
