import postcssNesting from "postcss-nesting";
import { fileURLToPath } from "node:url";

const posthogHost = process.env.NUXT_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogProjectApiKey =
  process.env.NUXT_POSTHOG_PROJECT_API_KEY ??
  process.env.NUXT_PUBLIC_POSTHOG_KEY ??
  "phc_qTwFbI32FdKblt68dmmYUaStTr4e0s3dzXdnlWc0AP9";
const posthogServerLogEnabled =
  process.env.POSTHOG_SERVER_LOG_ENABLED === "true" || process.env.NODE_ENV === "production";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  alias: {
    "@": fileURLToPath(new URL("./app", import.meta.url)),
    "@types": fileURLToPath(new URL("./shared/types", import.meta.url)),
    "@utils": fileURLToPath(new URL("./shared/utils", import.meta.url)),
    "@constants": fileURLToPath(new URL("./shared/constants", import.meta.url)),
    "~": fileURLToPath(new URL("./", import.meta.url)),
  },
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
    "@posthog/nuxt",
  ],
  compatibilityDate: "2024-11-16",
  runtimeConfig: {
    airtableKey: "",
    posthogHost,
    posthogLogEndpoint: `${posthogHost}/i/v1/logs`,
    posthogProjectApiKey,
    posthogServerLogEnabled,
    stripeWebhookSecretKey: "",
    public: {
      siteUrl: "",
    },
  },
  sourcemap: {
    client: "hidden",
  },
  nitro: {
    rollupConfig: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },
  posthogConfig: {
    publicKey: posthogProjectApiKey,
    host: posthogHost,
    clientConfig: {
      capture_exceptions: true,
    },
    serverConfig: {
      enableExceptionAutocapture: true,
    },
    sourcemaps: {
      enabled: true,
      project: process.env.POSTHOG_PROJECTID,
      personalApiKey: process.env.POSTHOG_KEY ?? "",
    },
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
