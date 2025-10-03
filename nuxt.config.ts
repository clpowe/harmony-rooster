import postcssNesting from "postcss-nesting";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],
  future: {
    compatibilityVersion: 4,
  },
  postcss: {
    plugins: {
      autoprefixer: {},
      cssnano: {
        plugins: [postcssNesting],
      },
    },
  },
  modules: [
    "nuxt-svgo",
    "@nuxt/image",
    "@nuxt/icon",
    "reka-ui/nuxt",
    "@vee-validate/nuxt",
    "nuxt-security",
    "@nuxt/fonts",
    "@unlok-co/nuxt-stripe",
  ],
  compatibilityDate: "2024-11-16",
  runtimeConfig: {
    airtableKey: "",
    stripeWebhookSecretKey: "",
  },
  stripe: {
    // Server
    server: {
      key: process.env.STRIPE_SECRET_KEY,
      options: {},
    },
    // Client
    client: {
      key: process.env.STRIPE_PUBLIC_KEY,
      options: {},
    },
  },
  vite: {
    server: {
      allowedHosts: ["nimbused-deborah-auricled.ngrok-free.dev"],
    },
  },
});
