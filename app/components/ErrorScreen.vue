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
    <header class="error-screen__header wrapper">
      <SiteBrand class="error-screen__brand" aria-label="Harmony Roosters home" />
    </header>

    <main class="error-screen__main wrapper">
      <section class="error-screen__card flow" aria-labelledby="error-screen-title">
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

        <div class="error-screen__actions cluster">
          <button
            type="button"
            class="button"
            data-size="small"
            data-variant="primary"
            @click="$emit('primary')"
          >
            {{ primaryLabel }}
          </button>

          <button
            v-if="secondaryLabel"
            type="button"
            class="button"
            data-size="small"
            data-variant="secondary"
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
@layer blocks {
  .error-screen {
    min-block-size: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--clr-surface-page);
  }

  .error-screen__header {
    padding-block: var(--space-500);
  }

  .error-screen__brand {
    --site-brand-mark-width: 1.5625rem;
    --site-brand-mark-height: 2.185rem;
    --site-brand-wordmark-width: clamp(9.4rem, 22vw, 11.5rem);
  }

  .error-screen__main {
    display: grid;
    place-items: center;
    padding-block: var(--space-panel);
  }

  .error-screen__card {
    --flow-space: var(--space-400);
    inline-size: min(100%, var(--measure-narrow));
    text-align: center;
  }

  .error-screen__status {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    color: var(--clr-text-muted);
    font-size: var(--text-display-md);
    line-height: var(--lh-display);
    font-weight: var(--fw-regular);
    letter-spacing: var(--tracking-display);
  }

  .error-screen__status-second {
    color: var(--clr-primary-500);
  }

  .error-screen__status-third {
    color: var(--clr-accent-600);
  }

  .error-screen__title {
    color: var(--clr-text-muted);
    font-size: var(--text-heading-1);
    line-height: var(--lh-heading);
    font-weight: var(--fw-regular);
    letter-spacing: var(--tracking-heading);
    text-wrap: balance;
  }

  .error-screen__message {
    max-inline-size: var(--measure-readable);
    margin-inline: auto;
    color: var(--clr-text-subtle);
    font-size: var(--text-body);
    line-height: var(--lh-body);
    text-wrap: pretty;
  }

  .error-screen__actions {
    justify-content: center;
  }

  .error-screen__footer-band {
    min-block-size: var(--control-size);
    background: var(--clr-neutral-600);
  }
}
</style>
