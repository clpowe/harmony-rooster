<script setup lang="ts">
	import Rooster from '../assets/images/Rooster.svg'

	defineProps<{
		title?: string
		paragraph?: string
	}>()
</script>

<template>
	<section class="flex flex-col gap-4 md:gap-8 relative mb-12">
		<img
			:src="Rooster"
			alt=""
			height="150"
			class="left-3/4 md:block h-48 absolute md:h-60 md:left-1/4 md:bottom-12 -z-10 opacity-60"
		/>
		<div class="justify-start max-w-[75ch] text-slate-700">
			<h1 class="h1 uppercase text-base md:text-xl mb-2">{{ title }}</h1>
			<h2 class="h2 !leading-[0.9em] text-wrap md:text-balance uppercase"
				>Providing <br />
				<span class="text-primary">Compassionate </span>
				<br />
				In-Home <span class="text-accent">Care</span></h2
			>
		</div>
		<div
			class="justify-start md:ml-[50%] flex flex-col gap-4 md:gap-8 md:self-end"
		>
			<p
				class="italic text-slate-500 max-w-md text-sm sm:text-sm md:text-xl md:max-w-lg"
				>{{ paragraph }}</p
			>
			<div class="flex gap-4 flex-wrap">
				<Button size="sm">Contact us</Button>
			</div>
		</div>
	</section>
</template>

<style>
	.h1 {
		line-break: auto;
		font-size: clamp(2rem, 10vw, 6rem);
	}

	.h2 {
		font-size: clamp(1.8rem, 5vw, 3rem);
		line-height: 1em;
		@apply uppercase;

		span {
			@apply text-primary;
		}
	}
</style>
