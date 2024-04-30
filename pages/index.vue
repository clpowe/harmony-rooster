<script setup>
	import Rooster from '../assets/images/Rooster.svg'
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
	const { data: staff } = await useAsyncData('staff', () =>
		fetchEntries({
			model: 'staff',
			apiKey: BUILDER_PUBLIC_API_KEY
		})
	)

	console.log(staff.value)
</script>

<template>
	<main class="max-w-6xl mx-auto p-4 md:p-8">
		<Content
			model="page"
			:content="content"
			:api-key="BUILDER_PUBLIC_API_KEY"
			:customComponents="registeredComponents"
		/>

		<div class="flex flex-col gap-8 md:flex-row mb-12">
			<section class="bg-white rounded-2xl p-8 space-y-8 md:max-w-80">
				<div>
					<h2 class="mb-4">Our <span>Services</span></h2>
					<p
						>Harmony Rooster, LLC is here to help. Our team of dedicated and
						qualified caregivers provides a helping hand with a variety of
						needs, including</p
					>
				</div>
				<ul class="flex flex-col gap-4">
					<li class="service-item">
						<div class="icon">
							<img :src="Care" alt="" />
						</div>
						<p> Personal care assistance </p>
					</li>
					<li class="service-item">
						<div class="icon">
							<img :src="Cook" alt="" />
						</div>
						<p> Meal preparation and light housekeeping </p>
					</li>
					<li class="service-item">
						<div class="icon">
							<img :src="Medication" alt="" />
						</div>
						<p> Medication reminders and management </p>
					</li>
				</ul>
				<p
					>We work closely with you and your loved one to create a personalized
					care plan that promotes self-reliance, personal growth, and a sense of
					fulfillment.</p
				>
			</section>

			<section class="p-4 md:p-8 space-y-4 overflow-hidden">
				<h2 class="mb-4">Meet our <span>team</span></h2>
				<p class=""
					>Our caregivers are not just qualified; they are compassionate and
					dedicated to making a difference in the lives of our clients. They
					undergo rigorous background checks, training, and ongoing education to
					ensure they provide the highest quality of care.</p
				>
				<ul class="flex gap-4 pt-6 overflow-x-scroll">
					<li v-for="s in staff" :key="s.id">
						<article class="p-4 bg-white rounded-md w-72">
							<img
								:src="s.data.picture"
								alt=""
								class="w-full rounded-md mb-4"
							/>
							<h3 class="font-bold text-xl mb-0">{{ s.data.name }}</h3>
							<p class="text-accent mb-2">{{ s.data.title }}</p>
							<p>{{ s.data.description }}</p>
						</article>
					</li>

					<li>
						<article
							class="p-8 bg-primary rounded-md w-72 h-full grid place-content-center text-center"
						>
							<p class="text-white text-5xl"> JOIN OUR TEAM </p>
						</article>
					</li>
				</ul>
			</section>
		</div>

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
				<p>Find answers to common questions about our services</p>
			</div>
			<div>
				<Accordion
					type="single"
					class="w-full"
					collapsible
					:default-value="defaultValue"
				>
					<AccordionItem
						v-for="item in accordionQuestions"
						:key="item.value"
						:value="item.value"
					>
						<AccordionTrigger>{{ item.title }}</AccordionTrigger>
						<AccordionContent>
							{{ item.content }}
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
