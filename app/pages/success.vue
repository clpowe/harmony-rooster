<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import ReceiptHeader from "@/components/receipt/ReceiptHeader.vue";
import { getReceiptPaymentLabel, getReceiptStatus } from "@utils/receipt-status";
import type { ReceiptStatus } from "@utils/receipt-status";

definePageMeta({
  layout: false,
  key: (route) => String(route.query.session_id ?? ""),
});

useHead({
  title: "Registration receipt | Harmony Roosters",
  titleTemplate: null,
  meta: [
    { name: "robots", content: "noindex, nofollow" },
    { name: "referrer", content: "no-referrer" },
  ],
});

const route = useRoute();
const sessionId = typeof route.query.session_id === "string" ? route.query.session_id : "";
const {
  data: checkoutData,
  error,
  pending,
  initialLoading,
  token,
  refresh: refreshCheckoutData,
  autoRefreshFinished,
} = useRegistrationReceipt(sessionId);
const isConfirmed = computed(() => checkoutData.value?.registration.state === "confirmed");
const copyMessage = ref("");
const copied = ref(false);
async function copyReceiptLink() {
  if (!token.value) return;
  copied.value = false;
  const url = new URL("/success", window.location.origin);
  url.searchParams.set("session_id", sessionId);
  url.hash = `receipt_token=${token.value}`;
  try {
    await navigator.clipboard.writeText(url.href);
    copied.value = true;
    copyMessage.value =
      "Receipt link copied. Keep it private; anyone with this link can view your receipt.";
  } catch {
    copyMessage.value = "Could not copy the receipt link. Please try again.";
  }
}

const className = computed(() => checkoutData.value?.session?.name ?? "Class details pending");
const orderNumber = computed(() => {
  if (!sessionId) return "Unavailable";
  return `...${sessionId.slice(-8)}`;
});

const formattedTotal = computed(() =>
  formatCurrency(checkoutData.value?.payment.total, checkoutData.value?.payment.currency),
);
const formattedClassDate = computed(() => formatClassDate(checkoutData.value?.session?.date));
const paymentMethod = computed(() => {
  const payment = checkoutData.value?.payment;
  const brand = payment?.brand ? formatPaymentBrand(payment.brand) : "Payment method";
  return payment?.last4 ? `${brand} ending in ${payment.last4}` : "Payment method unavailable";
});
const receiptStatusMessage = computed(() => {
  if (initialLoading.value) return "Loading your registration receipt.";
  if (error.value)
    return "We could not load this receipt. Open your complete receipt link or contact us.";
  return checkoutData.value?.registration.message ?? "Registration status unavailable.";
});
const retryReceiptLoad = () => refreshCheckoutData();
const headerStatus = computed<ReceiptStatus>(() => {
  if (initialLoading.value) return { label: "Loading receipt", tone: "pending", busy: true };
  if (error.value) return { label: "Status unavailable", tone: "warning", busy: false };
  return getReceiptStatus(
    checkoutData.value?.registration.state,
    checkoutData.value?.payment.status,
  );
});
const headerTitle = computed(() => {
  if (initialLoading.value) return "Loading your receipt";
  if (error.value) return "We could not load this receipt";
  return checkoutData.value?.registration.title ?? "Registration status unavailable";
});
const headerMessage = computed(() => {
  if (initialLoading.value) return "Payment details are loading.";
  if (error.value) return "Open your complete receipt link or contact Harmony Roosters.";
  return (
    checkoutData.value?.registration.message ??
    "Please open your complete receipt link or contact us for help."
  );
});
const paymentStatusLabel = computed(() =>
  getReceiptPaymentLabel(
    checkoutData.value?.registration.state,
    checkoutData.value?.payment.status,
  ),
);

function formatClassDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "Date pending";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatCurrency(value?: number | null, currency?: string | null) {
  if (typeof value !== "number") return "total unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency?.toUpperCase() ?? "USD",
  }).format(value / 100);
}

function formatPaymentBrand(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
</script>

<template>
  <div class="success-page">
    <header class="success-header wrapper repel" aria-label="Checkout confirmation">
      <SiteBrand class="success-header__brand" aria-label="Harmony Roosters home" />
      <AppButton href="/" variant="ghost" size="small" aria-label="Return to Harmony Roosters home">
        <template #icon-start><AppIcon name="lucide:arrow-left" /></template>
        Return home
      </AppButton>
    </header>

    <main class="success-main wrapper">
      <section
        class="receipt"
        aria-labelledby="receipt-title"
        :aria-busy="pending ? 'true' : 'false'"
      >
        <p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {{ receiptStatusMessage }}
        </p>
        <ReceiptHeader
          :title="headerTitle"
          :message="headerMessage"
          :receipt-id="checkoutData && !error ? orderNumber : undefined"
          :status="headerStatus"
        />

        <div
          v-if="error"
          class="receipt-section receipt__actions cluster"
          aria-label="Receipt recovery options"
        >
          <AppButton :disabled="pending" @click="retryReceiptLoad">
            <template v-if="pending" #icon-start><AppIcon name="lucide:loader-circle" /></template>
            {{ pending ? "Checking…" : "Try again" }}
          </AppButton>
          <AppButton href="/#contact" variant="accent">Contact support</AppButton>
        </div>

        <template v-else-if="checkoutData && !initialLoading">
          <section class="receipt-section flow" aria-label="Receipt actions">
            <p v-if="autoRefreshFinished" role="status">
              Confirmation is taking longer than expected. You can check again or contact us for
              help.
            </p>
            <div class="receipt__actions cluster">
              <AppButton
                v-if="!isConfirmed && checkoutData.registration.state !== 'refunded'"
                :disabled="pending"
                @click="retryReceiptLoad"
              >
                {{ pending ? "Checking…" : "Check again" }}
              </AppButton>
              <AppButton
                variant="ghost"
                :data-state="copied ? 'copied' : undefined"
                :disabled="!token"
                @click="copyReceiptLink"
              >
                <template #icon-start
                  ><AppIcon :name="copied ? 'lucide:check' : 'lucide:copy'"
                /></template>
                {{ copied ? "Link copied" : "Copy receipt link" }}
              </AppButton>
              <AppButton href="/#contact" variant="accent">Contact support</AppButton>
            </div>
            <p v-if="copyMessage" role="status" class="receipt__copy-message">{{ copyMessage }}</p>
          </section>

          <section class="receipt-section flow" data-variant="class" aria-labelledby="class-title">
            <header class="flow receipt-section__header">
              <h2 id="class-title" class="receipt-section__title">Class details</h2>
              <p class="receipt-section__meta">{{ className }}</p>
            </header>
            <dl class="receipt__details">
              <AppDetailRow icon="lucide:calendar-days" label="Date" :value="formattedClassDate" />
              <AppDetailRow
                icon="lucide:clock-3"
                label="Time"
                :value="checkoutData.session?.time ?? 'Time pending'"
              />
              <AppDetailRow
                icon="lucide:map-pin"
                label="Location"
                :value="checkoutData.session?.location ?? 'Location pending'"
              />
            </dl>
          </section>

          <section class="receipt-section flow" aria-labelledby="order-title">
            <div class="receipt-section__header repel">
              <h2 id="order-title" class="receipt-section__title">Order summary</h2>
              <p class="receipt-section__total">{{ formattedTotal }}</p>
            </div>
            <dl class="receipt__summary">
              <AppSummaryRow label="Payment status" :value="paymentStatusLabel" />
              <AppSummaryRow label="Payment method" :value="paymentMethod" />
              <AppSummaryRow label="Order number" :value="orderNumber" mono />
            </dl>
          </section>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
@layer blocks {
  .success-page {
    min-block-size: 100svh;
    display: grid;
    grid-template-rows: auto 1fr;
    background: var(--clr-surface-page);
    color: var(--clr-text);
  }

  .success-header {
    padding-block: var(--space-500);
  }
  .success-header__brand {
    --site-brand-wordmark-width: clamp(9.8rem, 20vw, 12.25rem);
  }
  .success-main {
    --wrapper-max: var(--measure-narrow);
    padding-block: var(--space-panel) var(--space-section);
  }

  .receipt {
    overflow: hidden;
    border-radius: var(--radius-card);
    background: var(--clr-surface);
    box-shadow: var(--shadow-100);
  }

  .receipt-section {
    --flow-space: var(--space-400);
    padding: var(--space-600) var(--space-panel);
    border-block-start: var(--border-width) solid var(--clr-border);
  }

  .receipt-section__header {
    --flow-space: var(--space-200);
    --repel-align: baseline;
  }
  .receipt-section__title {
    color: var(--clr-text);
    font-size: var(--text-heading-4);
    font-weight: var(--fw-medium);
    line-height: var(--lh-snug);
    letter-spacing: var(--tracking-heading);
  }

  .receipt-section__meta {
    color: var(--clr-text-muted);
    font-size: var(--text-body);
    line-height: var(--lh-body);
  }

  .receipt-section__total {
    color: var(--clr-primary-500);
    font-size: var(--text-heading-3);
    font-weight: var(--fw-medium);
    line-height: var(--lh-snug);
    letter-spacing: var(--tracking-heading);
  }

  .receipt__details,
  .receipt__summary {
    display: grid;
  }
  .receipt__actions {
    --cluster-gap: var(--space-300);
  }
  .receipt__copy-message {
    color: var(--clr-text-muted);
    font-size: var(--text-small);
  }

  @media (width < 34em) {
    .success-header {
      --repel-align: flex-start;
    }
    .success-header__brand {
      --site-brand-wordmark-width: 9.2rem;
    }
  }
}

@layer exceptions {
  .receipt-section[data-variant="class"] {
    background: color-mix(in srgb, var(--clr-primary-100) 20%, var(--clr-surface));
  }
}
</style>
