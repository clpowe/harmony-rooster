import { designTokensJson } from "@utils/design-tokens";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "application/json; charset=utf-8");
  return designTokensJson(await readDesignCss("global/tokens.css"));
});
