// Consume the fragment before analytics or the router can capture the receipt credential.
export default defineNuxtPlugin({
  name: "receipt-access",
  order: -25, // Before Nuxt router (-20) and PostHog (0), after payload revival (-30).
  setup() {
    const url = new URL(window.location.href);
    if (url.pathname !== "/success") return;
    const token = new URLSearchParams(url.hash.slice(1)).get("receipt_token");
    if (url.hash) {
      url.hash = "";
      window.history.replaceState(window.history.state, "", url.href);
    }
    const id = url.searchParams.get("session_id");
    if (!id || !/^cs_[A-Za-z0-9_]{1,240}$/.test(id)) return;
    const key = `receipt-access:${id}`;
    const access = useState<string | null>(key, () => null);
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      access.value = token;
      try {
        window.sessionStorage.setItem(key, token);
      } catch {
        /* Memory still works when storage is blocked. */
      }
    } else {
      try {
        access.value = window.sessionStorage.getItem(key);
      } catch {
        /* Require the original protected link. */
      }
    }
  },
});
