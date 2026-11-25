import postcssNesting from "postcss-nesting";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { useNuxt } from "@nuxt/kit";
import { randomUUID } from "node:crypto";

const require = createRequire(import.meta.url);

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
const runPosthogCli = async (...args: string[]) => {
  await promisify(execFile)(
    process.execPath,
    [require.resolve("@posthog/cli/run-posthog-cli.js"), "sourcemap", ...args],
    {
      env: {
        ...process.env,
        POSTHOG_CLI_HOST: "https://us.posthog.com",
        POSTHOG_CLI_PROJECT_ID: posthogSourcemapProjectId,
        POSTHOG_CLI_API_KEY: posthogPersonalApiKey,
      },
    },
  );
};
let posthogBuildOutput: { dir: string; serverDir: string } | undefined;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  site: {
    name: siteName,
    url: productionSiteUrl,
  },
  app: {
    // Source-map IDs change file contents after bundling; isolate each build so
    // returning browsers cannot reuse an older asset with a different SRI hash.
    buildAssetsDir: `/_nuxt/${process.env.VERCEL_DEPLOYMENT_ID ?? randomUUID()}/`,
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
      prerender: false,
      robots: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
  },
  hooks: {
    async "nitro:build:before"(nitro) {
      if (nitro.options.dev) return;
      // Inject once before nuxt-security hashes the assets. Injecting into copied
      // public assets later changes the IDs and invalidates both SRI and CSP.
      await runPosthogCli(
        "inject",
        "--directory",
        resolve(useNuxt().options.buildDir, "dist/client"),
      );
      posthogBuildOutput = nitro.options.output;
    },
    async close() {
      if (!posthogBuildOutput) return;
      await runPosthogCli(
        "inject",
        "--ignore",
        "**/node_modules/**",
        "--directory",
        posthogBuildOutput.serverDir,
      );
      await runPosthogCli("upload", "--directory", posthogBuildOutput.dir, "--delete-after");
    },
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
    server: "hidden",
  },
  nitro: {
    serverAssets: [
      {
        baseName: "design-css",
        dir: fileURLToPath(new URL("./app/assets/css/", import.meta.url)),
      },
    ],
    prerender: {
      crawlLinks: true,
      routes: ["/", "/design-tokens.css", "/design-tokens.json", "/design-foundation.css"],
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
      capture_pageview: "history_change",
      capture_pageleave: true,
      capture_exceptions: true,
    },
    serverConfig: {
      enableExceptionAutocapture: true,
    },
  },
  vite: {
    server: {
      allowedHosts: ["nimbused-deborah-auricled.ngrok-free.dev"],
    },
  },
});
