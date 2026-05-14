<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

type CheckoutSuccessData = {
  status: string;
  payment: {
    brand: string | null;
    last4: string | null;
  };
  total: number | null;
  session: {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
  } | null;
};

definePageMeta({
  layout: false,
});

useHead({
  title: "Purchase confirmed | Harmony Rooster",
});

const route = useRoute();
const sessionId = computed(() => {
  const rawSessionId = route.query.session_id;
  return typeof rawSessionId === "string" ? rawSessionId : rawSessionId?.[0];
});

if (!sessionId.value) {
  await navigateTo("/");
}

const {
  data: checkoutData,
  error,
  pending,
} = await useFetch<CheckoutSuccessData>("/api/stripe/success", {
  query: { session_id: sessionId.value },
  server: true,
  immediate: true,
});

const isPaid = computed(() => checkoutData.value?.status === "paid");
const className = computed(() => checkoutData.value?.session?.name ?? "Class details pending");
const orderNumber = computed(() => {
  if (!sessionId.value) return "Unavailable";
  return `...${sessionId.value.slice(-8)}`;
});

const formattedTotal = computed(() => formatCurrency(checkoutData.value?.total));
const formattedClassDate = computed(() => formatClassDate(checkoutData.value?.session?.date));
const paymentMethod = computed(() => {
  const payment = checkoutData.value?.payment;
  const brand = payment?.brand ? formatPaymentBrand(payment.brand) : "card";
  return payment?.last4 ? `${brand} ending in ${payment.last4}` : brand;
});

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/");
};

function formatClassDate(value?: string) {
  if (!value) return "Date pending";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "total unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
    <header class="success-header" aria-label="Checkout confirmation">
      <NuxtLink to="/" class="success-header__brand" aria-label="Harmony Rooster home">
        <SvgoIconRoosterbg
          class="success-header__mark"
          filled
          :fontControlled="true"
          aria-hidden="true"
        />
        <SvgoIconWordmark
          class="success-header__wordmark"
          filled
          :fontControlled="true"
          aria-hidden="true"
        />
      </NuxtLink>

      <button class="success-back" type="button" @click="goBack">
        <Icon name="lucide:arrow-left" class="success-back__icon" aria-hidden="true" />
        Back
      </button>
    </header>

    <main class="success-main">
      <section class="receipt" aria-labelledby="receipt-title">
        <div v-if="pending" class="receipt__status">
          <Icon name="lucide:loader-circle" class="receipt__spinner" aria-hidden="true" />
          <h1 id="receipt-title" class="receipt__title">Confirming your purchase</h1>
          <p class="receipt__lede">Payment details are loading.</p>
        </div>

        <div v-else-if="error" class="receipt__status">
          <Icon name="lucide:circle-alert" class="receipt__alert-icon" aria-hidden="true" />
          <h1 id="receipt-title" class="receipt__title">We could not load this receipt</h1>
          <p class="receipt__lede">Please try again or contact Harmony Rooster.</p>
        </div>

        <div v-else-if="isPaid" class="receipt__ready">
          <div class="receipt__top-rule" aria-hidden="true"></div>

          <header class="receipt__intro">
            <Icon name="lucide:badge-check" class="receipt__seal" aria-hidden="true" />
            <div>
              <p class="receipt__eyebrow">Purchase confirmed</p>
              <h1 id="receipt-title" class="receipt__title">Thank you for your purchase</h1>
              <p class="receipt__lede">Your spot has been reserved for {{ className }}.</p>
            </div>
          </header>

          <section class="receipt-section receipt-section--class" aria-labelledby="class-title">
            <div class="receipt-section__header">
              <h2 id="class-title">Class details</h2>
              <p>{{ className }}</p>
            </div>

            <dl class="class-grid">
              <div class="class-grid__item">
                <dt>
                  <Icon name="lucide:calendar-days" aria-hidden="true" />
                  Date
                </dt>
                <dd>{{ formattedClassDate }}</dd>
              </div>

              <div class="class-grid__item">
                <dt>
                  <Icon name="lucide:clock-3" aria-hidden="true" />
                  Time
                </dt>
                <dd>{{ checkoutData?.session?.time ?? "Time pending" }}</dd>
              </div>

              <div class="class-grid__item class-grid__item--wide">
                <dt>
                  <Icon name="lucide:map-pin" aria-hidden="true" />
                  Location
                </dt>
                <dd>{{ checkoutData?.session?.location ?? "Location pending" }}</dd>
              </div>
            </dl>
          </section>

          <section class="receipt-section" aria-labelledby="order-title">
            <div class="receipt-section__header">
              <h2 id="order-title">Order summary</h2>
              <p>{{ formattedTotal }}</p>
            </div>

            <dl class="summary-list">
              <div>
                <dt>Payment</dt>
                <dd>{{ paymentMethod }}</dd>
              </div>
              <div>
                <dt>Order number</dt>
                <dd>{{ orderNumber }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Paid</dd>
              </div>
            </dl>
          </section>
        </div>

        <div v-else class="receipt__status">
          <Icon name="lucide:clock-alert" class="receipt__alert-icon" aria-hidden="true" />
          <h1 id="receipt-title" class="receipt__title">Payment pending</h1>
          <p class="receipt__lede">Your registration will be confirmed when payment completes.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.success-page {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr;
  background:
    linear-gradient(
      180deg,
      color-mix(in oklch, var(--primary-100) 34%, transparent),
      transparent 28rem
    ),
    var(--surface-2);
  color: var(--secondary);
}

.success-header {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
  padding-block: clamp(1rem, 2.5vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.success-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.success-header__brand:focus-visible,
.success-back:focus-visible {
  outline: 3px solid var(--primary-400);
  outline-offset: 4px;
}

.success-header__mark {
  width: 1.9rem;
  height: 2.25rem;
  flex: 0 0 auto;
  fill: var(--primary-500);
}

.success-header__wordmark {
  width: clamp(9.8rem, 20vw, 12.25rem);
  height: auto;
}

.success-back {
  min-height: 44px;
  padding: 0.45rem 0.95rem 0.45rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid color-mix(in oklch, var(--secondary) 60%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in oklch, var(--surface-1) 76%, transparent);
  color: var(--text-1);
  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.success-back:hover {
  background: var(--surface-1);
  transform: translateX(-2px);
}

.success-back__icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.success-main {
  width: min(100% - 2rem, 40rem);
  margin-inline: auto;
  padding-block: clamp(1.75rem, 6vw, 4rem) clamp(2.5rem, 7vw, 5rem);
}

.receipt {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: var(--surface-1);
  box-shadow: 0 18px 44px rgb(40 53 82 / 0.1);
}

.receipt__top-rule {
  height: 0.45rem;
  background: linear-gradient(90deg, var(--primary-500) 0 72%, var(--accent-500) 72% 100%);
}

.receipt__ready {
  display: grid;
}

.receipt__intro {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: clamp(1.5rem, 4vw, 2.25rem) clamp(1.5rem, 4vw, 2.5rem);
}

.receipt__seal {
  width: 2.75rem;
  height: 2.75rem;
  color: oklch(52% 0.19 142);
  stroke-width: 1.8;
}

.receipt__eyebrow {
  --p-max-width: 100%;
  color: var(--accent-600);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
}

.receipt__title {
  max-width: 14ch;
  margin-top: 0.45rem;
  color: var(--primary-500);
  font-size: clamp(2rem, 5.6vw, 2.85rem);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: 0;
}

.receipt__lede {
  --p-max-width: 31rem;
  margin-top: 0.85rem;
  color: var(--neutral-600);
  font-size: 1rem;
  line-height: 1.35;
}

.receipt-section {
  padding: clamp(1.35rem, 3.5vw, 2rem) clamp(1.5rem, 4vw, 2.5rem);
  border-top: 1px solid color-mix(in oklch, var(--neutral-200) 86%, transparent);
}

.receipt-section--class {
  background: color-mix(in oklch, var(--primary-100) 20%, var(--surface-1));
}

.receipt-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.receipt-section__header h2 {
  color: var(--secondary);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.15;
}

.receipt-section__header p {
  --p-max-width: 24rem;
  color: var(--primary-600);
  font-weight: 700;
  line-height: 1.25;
  text-align: right;
  overflow-wrap: anywhere;
}

.class-grid {
  display: grid;
  gap: 0.9rem;
}

.class-grid__item {
  min-width: 0;
  padding: 1rem;
  border: 1px solid color-mix(in oklch, var(--neutral-200) 88%, transparent);
  border-radius: 12px;
  background: var(--surface-1);
}

.class-grid__item dt,
.summary-list dt {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--neutral-600);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
}

.class-grid__item dt svg {
  width: 1rem;
  height: 1rem;
  color: var(--primary-500);
}

.class-grid__item dd {
  margin-top: 0.55rem;
  color: var(--text-1);
  font-size: clamp(1.05rem, 2.3vw, 1.22rem);
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.summary-list {
  display: grid;
  gap: 0.7rem;
}

.summary-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.summary-list dd {
  color: var(--text-1);
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}

.receipt__status {
  min-height: 24rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  display: grid;
  align-content: center;
  gap: 0.9rem;
}

.receipt__status .receipt__title {
  max-width: 16ch;
}

.receipt__spinner,
.receipt__alert-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--primary-500);
}

.receipt__spinner {
  animation: receipt-spin 900ms linear infinite;
}

@media (min-width: 38rem) {
  .class-grid {
    grid-template-columns: 1fr 1fr;
  }

  .class-grid__item--wide {
    grid-column: 1 / -1;
  }
}

@media (max-width: 34rem) {
  .success-header {
    align-items: flex-start;
  }

  .success-back {
    padding-inline: 0.7rem;
  }

  .success-header__wordmark {
    width: 9.2rem;
  }

  .receipt__intro {
    grid-template-columns: 1fr;
  }

  .receipt-section__header,
  .summary-list div {
    display: grid;
    gap: 0.35rem;
  }

  .receipt-section__header p,
  .summary-list dd {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .success-back,
  .receipt__spinner {
    transition-duration: 0ms;
    animation: none;
  }
}

@keyframes receipt-spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
