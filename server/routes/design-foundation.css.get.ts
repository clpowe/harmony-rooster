export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/css; charset=utf-8");
  const [entry, layers] = await Promise.all([
    readDesignCss("main.css"),
    readDesignCss("layers.css"),
  ]);
  const imports = Array.from(entry.matchAll(/@import url\("([^"]+)"\) layer\(([\w-]+)\);/g));
  const rules = await Promise.all(
    imports
      .filter(([, , layer]) => layer !== "tokens")
      .map(async ([, file, layer]) => `@layer ${layer} {\n${await readDesignCss(file!)}}\n`),
  );
  return `${layers}@import url("/design-tokens.css") layer(tokens);\n\n${rules.join("\n")}`;
});
