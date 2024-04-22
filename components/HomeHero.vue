<script setup>
	import Rooster from '../assets/images/Rooster.svg'
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
			<p class="uppercase text-base md:text-xl mb-2">Harmony Rooster LLC</p>
			<h1 class="!leading-[0.9em] text-wrap md:text-balance uppercase"
				>Providing <br />
				<span class="text-primary">Compassionate </span>
				<br />
				In-Home <span class="text-accent">Care</span></h1
			>
		</div>
		<div
			class="justify-start md:ml-[50%] flex flex-col gap-4 md:gap-8 md:self-end"
		>
			<p
				class="italic text-slate-500 max-w-md text-sm sm:text-sm md:text-xl md:max-w-lg"
				>We offer compassionate, non-emergency in-home care services designed to
				promote independence, dignity, and overall well-being.</p
			>
			<div class="flex gap-4 flex-wrap">
				<Button size="sm">Contact us</Button>
			</div>
		</div>
	</section>
</template>
