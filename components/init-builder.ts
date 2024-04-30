import HomeHero from './HomeHero.vue'

export const registeredComponents = [
	{
		component: HomeHero,
		name: 'HomeHero',
		inputs: [
			{
				name: 'title',
				type: 'string'
			},
			{
				name: 'paragraph',
				type: 'longText'
			},
			{
				name: 'image',
				type: 'file',
				allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
				required: true,
				defaultValue:
					'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d'
			}
		]
	}
]
