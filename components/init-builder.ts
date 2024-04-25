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
			}
		]
	}
]
