<script setup>
	const accordionQuestions = [
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
	<main class="">
		<HomeHero></HomeHero>
		<section class="OneThree">
			<OurServices />
			<MeetOurTeam />
		</section>
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

		<section class="card flex mb-12 twoCol">
			<div>
				<h2
					><span class="text-accent">Frequently</span> Asked
					<span>Questions</span></h2
				>
				<p>Find answers to common questions about our services</p>
			</div>
			<div> </div>
		</section>

		<section class="card flex mb-12 twoCol">
			<div>
				<h2>Contact <span>Us</span> </h2>
				<p>have a question? We’re here to help!</p>
			</div>

			<ContactForm />
		</section>
	</main>
</template>

<style></style>
