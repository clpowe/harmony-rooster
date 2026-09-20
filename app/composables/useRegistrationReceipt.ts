import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { RegistrationOutcome } from "../../shared/types/registration-outcome";

export function useRegistrationReceipt(sessionId: string) {
  const token = useState<string | null>(`receipt-access:${sessionId}`, () => null);
  const receipt = useFetch<RegistrationOutcome>("/api/stripe/success", {
    key: `registration-outcome:${sessionId}`,
    query: { session_id: sessionId },
    headers: computed(() => ({ Authorization: `Bearer ${token.value ?? ""}` })),
    server: false,
    immediate: false,
    watch: false,
    retry: 0,
  });
  const started = ref(false);
  const autoRefreshFinished = ref(false);
  let active = false;
  let deadline = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function load() {
    await receipt.refresh();
    if (!active || receipt.error.value || !receipt.data.value?.registration.canRefresh) return;
    if (Date.now() >= deadline) {
      autoRefreshFinished.value = true;
      return;
    }
    timer = setTimeout(
      () => {
        void load();
      },
      Math.min(5000, deadline - Date.now()),
    );
  }

  async function refresh() {
    if (receipt.pending.value) return;
    clearTimeout(timer);
    deadline = Date.now() + 30_000;
    autoRefreshFinished.value = false;
    await load();
  }

  onMounted(() => {
    active = true;
    started.value = true;
    void refresh();
  });
  onBeforeUnmount(() => {
    active = false;
    clearTimeout(timer);
    receipt.clear();
  });

  return {
    data: receipt.data,
    error: receipt.error,
    pending: receipt.pending,
    token,
    refresh,
    autoRefreshFinished,
    initialLoading: computed(
      () => !started.value || (receipt.pending.value && !receipt.data.value),
    ),
  };
}
