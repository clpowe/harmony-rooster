export async function readDesignCss(file: string) {
  const source = await useStorage("assets:design-css").getItem<string>(file);
  if (typeof source !== "string") throw new Error(`Missing design stylesheet ${file}`);
  return source;
}
