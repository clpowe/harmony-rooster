<template>
	<div id="home">
		<div v-if="content || isPreviewing()">
			<div>
				Page title:
				{{ content?.data?.title || 'Unpublished' }}
			</div>
			<Content
				:model="page"
				:content="content"
				:api-key="apiKey"
				:customComponents="registeredComponents"
			/>
		</div>
		<div v-else>Content not Found</div>
	</div>
</template>

<script setup>
	import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
	import { registeredComponents } from '../components/init-builder'

	const BUILDER_PUBLIC_API_KEY = '47944c5073d144f5b055aaf7305da050'

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
