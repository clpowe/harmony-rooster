<script setup lang="ts">
const props = defineProps<{
  statusCode: string | number;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
}>();

defineEmits<{
  primary: [];
  secondary: [];
}>();
</script>

<template>
  <div class="error-screen">
    <header class="error-screen__header">
      <NuxtLink to="/" class="error-screen__brand" aria-label="Harmony Rooster home">
        <SvgoIconRoosterbg
          class="error-screen__mark"
          filled
          :fontControlled="true"
          aria-hidden="true"
        />
        <span class="error-screen__wordmark">
          <span class="error-screen__wordmark-primary">Harmony</span>
          <span class="error-screen__wordmark-accent">Rooster</span>
        </span>
      </NuxtLink>
    </header>

    <main class="error-screen__main">
      <section class="error-screen__card" aria-labelledby="error-screen-title">
        <p class="error-screen__status" aria-hidden="true">
          <span class="error-screen__status-first">
            {{ String(statusCode).slice(0, 1) }}
          </span>
          <span class="error-screen__status-second">
            {{ String(statusCode).slice(1, 2) }}
          </span>
          <span class="error-screen__status-third">
            {{ String(statusCode).slice(2) || String(statusCode).slice(-1) }}
          </span>
        </p>

        <h1 id="error-screen-title" class="error-screen__title">{{ title }}</h1>
        <p class="error-screen__message">{{ message }}</p>

        <div class="error-screen__actions">
          <button type="button" class="error-screen__button" @click="$emit('primary')">
            {{ primaryLabel }}
          </button>

          <button
            v-if="secondaryLabel"
            type="button"
            class="error-screen__button error-screen__button--secondary"
            @click="$emit('secondary')"
          >
            {{ secondaryLabel }}
          </button>
        </div>
      </section>
    </main>

    <div class="error-screen__footer-band" aria-hidden="true" />
  </div>
</template>

<style scoped>
.error-screen {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #f6f6f6;
  border: 1px solid #000;
}

.error-screen__header {
  padding: 1.5rem 2rem;
}

.error-screen__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.error-screen__brand:focus-visible,
.error-screen__button:focus-visible {
  outline: 3px solid var(--primary-500);
  outline-offset: 4px;
}

.error-screen__mark {
  width: 1.5625rem;
  height: 2.185rem;
  color: var(--primary-500);
  fill: currentColor;
}

.error-screen__wordmark {
  display: inline-flex;
  gap: 0.25rem;
  align-items: baseline;
  font-size: 1rem;
  line-height: 1;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.error-screen__wordmark-primary {
  color: var(--primary-500);
}

.error-screen__wordmark-accent {
  color: var(--button-accent-strong);
}

.error-screen__main {
  display: grid;
  place-items: center;
  padding: 3rem 1rem;
}

.error-screen__card {
  display: grid;
  justify-items: center;
  gap: 1rem;
  width: min(100%, 44.375rem);
  text-align: center;
}

.error-screen__status {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-size: clamp(4.5rem, 14vw, 5rem);
  line-height: 0.975;
  font-weight: 700;
  text-transform: uppercase;
  color: #4c4c4c;
}

.error-screen__status-first {
  color: #4c4c4c;
}

.error-screen__status-second {
  color: var(--primary-500);
}

.error-screen__status-third {
  color: var(--button-accent-strong);
}

.error-screen__title {
  font-size: clamp(3rem, 14vw, 5rem);
  line-height: 0.975;
  font-weight: 700;
  text-transform: uppercase;
  color: #4c4c4c;
}

.error-screen__message {
  width: min(100%, 30.5rem);
  color: #6d6d6d;
  font-size: 1rem;
  line-height: 1.5;
  font-style: italic;
  text-transform: uppercase;
  text-wrap: balance;
}

.error-screen__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.error-screen__button {
  border: 1px solid var(--button-primary);
  border-radius: var(--radius-full);
  background: var(--button-primary);
  color: #fff;
  padding: 0.5rem 0.75rem;
  min-height: 2rem;
  font-size: 0.75rem;
  line-height: 1.333;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.error-screen__button:hover {
  background: var(--button-primary-active);
  border-color: var(--button-primary-active);
}

.error-screen__button:active {
  transform: translateY(1px);
}

.error-screen__button--secondary {
  background: transparent;
  color: var(--button-primary);
}

.error-screen__button--secondary:hover {
  background: rgb(4 95 126 / 0.08);
  color: var(--button-primary);
}

.error-screen__footer-band {
  min-height: 3.4375rem;
  background: #6d6e70;
}

@media (max-width: 40rem) {
  .error-screen__header {
    padding-inline: 1rem;
  }

  .error-screen__main {
    padding-block: 2.5rem;
  }

  .error-screen__wordmark {
    font-size: 0.9375rem;
  }

  .error-screen__title {
    font-size: clamp(2.75rem, 18vw, 4.5rem);
  }

  .error-screen__message {
    max-width: 22rem;
  }
}
</style>
