import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  test: {
    coverage: {
      include: ["app/composables/**/*.ts", "server/**/*.ts", "shared/**/*.ts"],
      reporter: ["text", "json-summary"],
    },
    include: ["app/**/*.test.ts", "server/**/*.test.ts", "shared/**/*.test.ts"],
  },
});
