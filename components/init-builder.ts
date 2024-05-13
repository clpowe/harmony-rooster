import HomeHero from './HomeHero.vue'
import OurServices from './OurServices.vue'
import MeetOurTeam from './MeetOurTeam.vue'

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
	},
	{
		component: OurServices,
		name: 'OurServices',
		inputs: [
			{
				name: 'text',
				type: 'longtext'
			},
			{
				name: 'items',
				type: 'list',
				subFields: [
					{
						name: 'icon',
						type: 'file',
						allowedFileTypes: ['svg'],
						required: true
					},
					{
						name: 'text',
						type: 'string'
					}
				]
			},
			{
				name: 'subText',
				type: 'longText'
			}
		]
	},
	{
		component: MeetOurTeam,
		name: 'MeetOurTeam',
		inputs: [
			{
				name: 'text',
				type: 'longText'
			}
		]
	}
]
