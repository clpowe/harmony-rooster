<template>
	<section class="p-4 md:p-8 space-y-4 overflow-hidden">
		<h2 class="mb-4">Meet our <span>team</span></h2>
		<p class="">{{ text }}</p>
		<ul class="flex gap-4 pt-6 overflow-x-scroll">
			<li v-for="s in staff" :key="s.id">
				<article class="p-4 bg-white rounded-md w-72">
					<img :src="s.data.picture" alt="" class="w-full rounded-md mb-4" />
					<h3 class="font-bold text-xl mb-0">{{ s.data.name }}</h3>
					<p class="text-accent mb-2">{{ s.data.title }}</p>
					<p>{{ s.data.description }}</p>
				</article>
			</li>

			<!-- <li>
				<article
					class="p-8 bg-primary rounded-md w-72 h-full grid place-content-center text-center"
				>
					<p class="text-white text-5xl"> JOIN OUR TEAM </p>
				</article>
			</li> -->
		</ul>
	</section>
</template>

<script setup lang="ts">
	defineProps<{
		text: string
	}>()

	import { fetchEntries } from '@builder.io/sdk-vue'

	// TODO: enter your public API key
	const BUILDER_PUBLIC_API_KEY = '47944c5073d144f5b055aaf7305da050' // ggignore

	// fetch builder content data
	const { data: staff } = await useAsyncData('staff', () =>
		fetchEntries({
			model: 'staff',
			apiKey: BUILDER_PUBLIC_API_KEY
		})
	)
</script>

<style scoped></style>
