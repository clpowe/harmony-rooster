<script setup>
	import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
	import '@builder.io/sdk-vue/css'
	import HomeHero from './components/HomeHero.vue'

	const registeredComponents = [
		{
			component: HomeHero,
			name: 'Home Hero',
			inputs: [
				{
					title: 'text',
					type: 'string',
					defaultValue: 'Harmony Rooster LLC'
				}
			]
		}
	]

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
</script>

<template>
	<div>
		<header>
			<div
				class="max-w-6xl mx-auto p-4 md:p-8 flex justify-between items-center"
			>
				<div class="flex gap-4 items-center">
					<SvgoIconRoosterbg
						class="w-12 h-12 fill-primary"
						filled
						:fontControlled="false"
					/>
				</div>

				<div class="flex gap-4">
					<Button size="sm">Lets Chat</Button>
					<Button size="sm" variant="outline">813-888-8888</Button>
				</div>
			</div>
		</header>
		<NuxtPage />
		<footer>
			<p>Harmony Rooster LLC 2022</p>
		</footer>
	</div>
</template>
