<template>
	<div id="home">
		<div v-if="canShowContent">
			<div>
				Page title:
				{{ content?.data?.title || 'Unpublished' }}
			</div>
			<Content
				:model="page"
				:content="content"
				:api-key="apiKey"
				:customComponents="getRegisteredComponents()"
			/>
		</div>
		<div v-else>Content not Found</div>
	</div>
</template>

<script setup>
	import { registeredComponents } from '../components/registeredComponents.js'
	import { Content, isPreviewing, fetchOneEntry } from '@builder.io/sdk-vue'

	// TODO: enter your public API key
	const apiKey = '47944c5073d144f5b055aaf7305da050'

	const route = useRoute()
	const urlPath = computed(() => `/${route.params.slug.join('/')}`)
	const content = ref(null)
	const canShowContent = ref(false)

	// Fetch the Builder content for the page that matches the URL path
	try {
		const response = await fetchOneEntry({
			model: 'page',
			apiKey,
			userAttributes: {
				urlPath: urlPath.value
			}
		})
		content.value = response
		canShowContent.value = content.value || isPreviewing()
	} catch (error) {
		console.error('Builder content not found:', error)
		if (process.server) {
			// Set the HTTP response status code to 404 if no content is found
			const nuxtApp = useNuxtApp()
			nuxtApp.ssrContext.event.res.statusCode = 404
		}
	}
	const getRegisteredComponents = () => {
		return registeredComponents
	}
</script>
