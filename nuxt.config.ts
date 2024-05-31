// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	css: ['@/assets/css/main.css'],
	postcss: {
		plugins: {
			autoprefixer: {},
			cssnano: {}
		}
	},
	modules: ['nuxt-svgo', '@nuxt/image']
})