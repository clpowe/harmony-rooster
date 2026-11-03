import postcssNesting from "postcss-nesting";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const siteName = "Harmony Roosters";
const productionSiteUrl = "https://www.harmonyroosters.com";

if (process.env.NODE_ENV === "production") {
  process.env.NUXT_PUBLIC_SITE_NAME = siteName;
  process.env.NUXT_PUBLIC_SITE_URL = productionSiteUrl;
}

// Dev-only routes are stripped from Vercel production builds (VERCEL_ENV=production).
// Local dev and Vercel preview (staging) deployments keep them.
const isProductionDeployment = process.env.VERCEL_ENV === "production";
const devOnlyRoutes = ["/design-system"];

const posthogHost = process.env.NUXT_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogProjectApiKey =
  process.env.NUXT_POSTHOG_PROJECT_API_KEY ?? process.env.NUXT_PUBLIC_POSTHOG_KEY ?? "";
if (isProductionDeployment && !posthogProjectApiKey) {
  throw new Error("Set NUXT_POSTHOG_PROJECT_API_KEY for the production PostHog project.");
}
const posthogServerLogEnabled =
  process.env.POSTHOG_SERVER_LOG_ENABLED === "true" || process.env.NODE_ENV === "production";
const posthogSourcemapProjectId =
  process.env.NUXT_POSTHOG_PROJECTID ?? process.env.POSTHOG_PROJECTID;
const posthogPersonalApiKey = process.env.NUXT_POSTHOG_KEY ?? process.env.POSTHOG_KEY ?? "";

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
  hooks: {
    "pages:extend"(pages) {
      if (!isProductionDeployment) return;
      for (let i = pages.length - 1; i >= 0; i--) {
        if (devOnlyRoutes.includes(pages[i]!.path)) pages.splice(i, 1);
      }
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
      projectId: posthogSourcemapProjectId,
      personalApiKey: posthogPersonalApiKey,
    },
  },
  vite: {
    server: {
      allowedHosts: ["nimbused-deborah-auricled.ngrok-free.dev"],
    },
  },
});
