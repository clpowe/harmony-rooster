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
	<section class="card faq flex mb-12 twoCol">
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
						<AccordionHeader>
							<AccordionTrigger>{{ item.question }}</AccordionTrigger>
						</AccordionHeader>
						<AccordionContent class="accordion-content">
							{{ item.answer }}
						</AccordionContent>
					</AccordionItem>

				</template>
			</AccordionRoot>
		</div>
	</section>
</template>

<style></style>
