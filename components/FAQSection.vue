<script setup lang="ts">
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'radix-vue'

const accordionItems = [
	{
		value: 'question-1',
		question: 'What is hame care?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern.'
	},
	{
		value: 'question-2',
		question: 'Who is eligible?',
		answer:
			"Yes. It's unstyled by default, giving you freedom over the look and feel."
	},
	{
		value: 'question-3',
		question: 'How much does it cost?',
		answer: 'Yes! You can use the transition prop to configure the animation.'
	},
	{
		value: 'question-4',
		question: 'Is this covered by medicare?',
		answer: 'Yes! You can use the transition prop to configure the animation.'
	},
	{
		value: 'question-5',
		question: 'Do you take insurance?',
		answer: 'Yes! You can use the transition prop to configure the animation.'
	}
]
</script>

<template>
	<section class="card faq twoCol">
		<div>
			<Typography tag="h2" variant="heading-medium"><span>Frequently</span> Asked
				<span>Questions</span>
			</Typography>
			<p>Find answers to common questions about our services</p>
		</div>
		<div>
			<AccordionRoot default-value="question-1" :collapsible="true" class="accordion">

				<template v-for="item in accordionItems" :key="item.value">
					<AccordionItem :value="item.value" class="accordion-item">
						<AccordionHeader class="accordion-header">
							<AccordionTrigger class="accordion-trigger">{{ item.question }}
								<Icon name="bi:plus-lg" />
							</AccordionTrigger>
						</AccordionHeader>
						<AccordionContent class="AccordionContent accordion-content">
							{{ item.answer }}
						</AccordionContent>
					</AccordionItem>
				</template>
			</AccordionRoot>
		</div>
	</section>
</template>

<style scoped>
:deep(.accordion-item) {
	overflow: hidden;
	margin-top: 1px;
}

:deep(.accordion-header) {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

:deep(.accordion-trigger) {
	all: unset;
	will-change: transform;
	padding-block: .5rem;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

:deep(.accordion-content) {
	overflow: hidden;
	will-change: height;
	padding-block: var(--size-3);
}

:deep(.accordion-content[data-state='open']) {
	animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

:deep(.accordion-content[data-state='closed']) {
	animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

@keyframes slideDown {
	from {
		height: 0;
	}

	to {
		height: var(--radix-accordion-content-height);
	}
}

@keyframes slideUp {
	from {
		height: var(--radix-accordion-content-height);
	}

	to {
		height: 0;
	}
}
</style>
