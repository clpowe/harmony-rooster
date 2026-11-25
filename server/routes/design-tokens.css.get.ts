export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/css; charset=utf-8");
  return readDesignCss("global/tokens.css");
});
