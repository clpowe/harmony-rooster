import postcssNesting from "postcss-nesting";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const siteName = "Harmony Roosters";
const productionSiteUrl = "https://www.harmonyroosters.com";

if (process.env.NODE_ENV === "production") {
  process.env.NUXT_PUBLIC_SITE_NAME = siteName;
  process.env.NUXT_PUBLIC_SITE_URL = productionSiteUrl;
}

const posthogHost = process.env.NUXT_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogProjectApiKey =
  process.env.NUXT_POSTHOG_PROJECT_API_KEY ??
  process.env.NUXT_PUBLIC_POSTHOG_KEY ??
  "phc_qTwFbI32FdKblt68dmmYUaStTr4e0s3dzXdnlWc0AP9";
const posthogServerLogEnabled =
  process.env.POSTHOG_SERVER_LOG_ENABLED === "true" || process.env.NODE_ENV === "production";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  site: {
    name: siteName,
    url: productionSiteUrl,
  },
  app: {
    head: {
      title: siteName,
      // Keep layer order ahead of route CSS during SSR, hydration and Vite HMR.
      style: [
        {
          key: "style-layer-order",
          tagPriority: "critical",
          innerHTML: readFileSync(new URL("./app/assets/css/layers.css", import.meta.url), "utf8"),
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  devtools: { enabled: true },
  alias: {
    "@": fileURLToPath(new URL("./app", import.meta.url)),
    "@types": fileURLToPath(new URL("./shared/types", import.meta.url)),
    "@utils": fileURLToPath(new URL("./shared/utils", import.meta.url)),
    "@constants": fileURLToPath(new URL("./shared/constants", import.meta.url)),
    "~": fileURLToPath(new URL("./", import.meta.url)),
  },
  css: ["@/assets/css/main.css"],
  sitemap: {
    exclude: ["/design-system"],
  },
  routeRules: {
    "/design-system": {
      robots: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
  },
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
    "@nuxtjs/seo",
    "reka-ui/nuxt",
    "@vee-validate/nuxt",
    "nuxt-security",
    "@nuxt/fonts",
    "@posthog/nuxt",
    "@vercel/speed-insights/nuxt",
    "@vercel/analytics",
  ],
  compatibilityDate: "2024-11-16",
  runtimeConfig: {
    airtableKey: "",
    posthogHost,
    posthogLogEndpoint: `${posthogHost}/i/v1/logs`,
    posthogProjectApiKey,
    posthogServerLogEnabled,
    stripeSecretKey: "",
    stripeWebhookSecretKey: "",
    resendApiKey: "",
    public: {
      siteUrl: "",
      receiptFromEmail: "",
      contactFromEmail: "",
      contactToEmail: "contact@harmonyroosters.com",
    },
  },
  sourcemap: {
    client: "hidden",
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
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
  vite: {
    server: {
      allowedHosts: ["nimbused-deborah-auricled.ngrok-free.dev"],
    },
  },
});
