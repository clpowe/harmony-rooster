<script setup>
	import Care from '../assets/images/Care.svg'
	import Cook from '../assets/images/Cook.svg'
	import Medication from '../assets/images/Medication.svg'

	const accordionQuestions = [
		{
			value: 'question-1',
			title: 'What is hame care?',
			content: 'Yes. It adheres to the WAI-ARIA design pattern.'
		},
		{
			value: 'question-2',
			title: 'Who is eligible?',
			content:
				"Yes. It's unstyled by default, giving you freedom over the look and feel."
		},
		{
			value: 'question-3',
			title: 'How much does it cost?',
			content:
				'Yes! You can use the transition prop to configure the animation.'
		},
		{
			value: 'question-4',
			title: 'Is this covered by medicare?',
			content:
				'Yes! You can use the transition prop to configure the animation.'
		},
		{
			value: 'question-5',
			title: 'Do you take insurance?',
			content:
				'Yes! You can use the transition prop to configure the animation.'
		}
	]

	import { Content, fetchOneEntry, fetchEntries } from '@builder.io/sdk-vue'

	// Register your Builder components
	import { registeredComponents } from '../components/init-builder'

	// TODO: enter your public API key
	const BUILDER_PUBLIC_API_KEY = '47944c5073d144f5b055aaf7305da050' // ggignore

	const route = useRoute()

	// fetch builder content data
	const { data: content } = await useAsyncData('builderData', () =>
		fetchOneEntry({
			model: 'page',
			apiKey: BUILDER_PUBLIC_API_KEY,
			userAttributes: {
				urlPath: route.path
			}
		})
	)
	// fetch builder content data

	const { data: FAQ } = await useAsyncData('frequently-asked-questions', () =>
		fetchOneEntry({
			model: 'frequently-asked-questions',
			apiKey: BUILDER_PUBLIC_API_KEY
		})
	)
</script>

<template>
	<main class="max-w-6xl mx-auto p-4 md:p-8">
		<Content
			model="page"
			:content="content"
			:api-key="BUILDER_PUBLIC_API_KEY"
			:customComponents="registeredComponents"
		/>

		<section
			class="bg-white rounded-2xl p-8 flex gap-4 flex-col md:flex-row relative overflow-hidden mb-12"
		>
			<img src="https://picsum.photos/200" alt="" class="rounded-lg" />
			<div class="max-w-xl p-4 z-10">
				<h2 class="mb-4">About <span>Us</span></h2>
				<p class="max-w-[75ch]">
					Harmony Rooster, LLC is a locally owned and operated company based in
					Tampa, Florida. The company was founded by Derek and Cynthia Robinson,
					who are passionate about providing exceptional in-home care services
					that empower individuals to live their best lives.</p
				>
			</div>
			<img
				src="../assets/images/roosterbg.svg"
				alt=""
				class="absolute -bottom-60 md:-bottom-36 right-0 z-0"
			/>
		</section>

		<section class="bg-white rounded-2xl p-8 flex mb-12 twoCol">
			<div>
				<h2
					><span class="text-accent">Frequently</span> Asked
					<span>Questions</span></h2
				>
				<p>{{ FAQ.data.description }}</p>
			</div>
			<div>
				<Accordion
					type="single"
					class="w-full"
					collapsible
					:default-value="defaultValue"
				>
					<AccordionItem
						v-for="item in FAQ.data.questions"
						:key="item.question"
						:value="item.question"
					>
						<AccordionTrigger>{{ item.question }}</AccordionTrigger>
						<AccordionContent>
							{{ item.answer }}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</section>

		<section class="bg-white rounded-2xl p-8 flex mb-12 twoCol">
			<div>
				<h2>Contact <span>Us</span> </h2>
				<p>have a question? We’re here to help!</p>
			</div>

			<ContactForm />
		</section>
	</main>
</template>

<style>
	h1 {
		line-break: auto;
		font-size: clamp(2rem, 10vw, 6rem);
	}

	h2 {
		font-size: clamp(1.8rem, 5vw, 3rem);
		line-height: 1em;
		@apply uppercase;

		span {
			@apply text-primary;
		}
	}

	p {
		@apply text-slate-500;
		max-width: 75ch;
	}

	.service-item {
		@apply flex gap-4;

		.icon {
			@apply min-h-12 min-w-12 max-h-12 max-w-12 p-2 rounded bg-accent grid place-content-center;
		}
	}

	main {
		container-type: inline-size;
		container-name: main;
	}

	.twoCol {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@container main (inline-size > 65ch) {
		.twoCol {
			display: grid;
			grid-template-columns: 1fr 60%;
		}
	}
</style>
