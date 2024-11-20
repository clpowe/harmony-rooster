import postcssNesting from 'postcss-nesting'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	css: ['@/assets/css/main.css'],

	postcss: {
		plugins: {
			autoprefixer: {},
			cssnano: {
				plugins: [postcssNesting]
			}
		}
	},

	modules: ['nuxt-svgo', '@nuxt/image', '@nuxt/icon', '@formkit/nuxt'],
	formkit: {
		autoImport: true
	},
	compatibilityDate: '2024-11-16'
})
