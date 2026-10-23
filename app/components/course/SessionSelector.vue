<script setup lang="ts">
import type { Session } from "@types/courses";

const props = withDefaults(
  defineProps<{
    sessions: Session[];
    legend?: string;
    selectedVariant?: "tint" | "solid";
    disabled?: boolean;
  }>(),
  { legend: "Upcoming sessions", selectedVariant: "solid", disabled: false },
);
const model = defineModel<string>();
const groupName = `sessions-${useId()}`;
const hintId = `${groupName}-hint`;
const strip = ref<HTMLElement | null>(null);
const canScrollBack = ref(false);
const canScrollForward = ref(false);
let resizeObserver: ResizeObserver | undefined;

function updateScrollState() {
  const element = strip.value;
  if (!element) {
    canScrollBack.value = false;
    canScrollForward.value = false;
    return;
  }
  const maxScroll = element.scrollWidth - element.clientWidth;
  canScrollBack.value = element.scrollLeft > 1;
  canScrollForward.value = element.scrollLeft < maxScroll - 1;
}

function scrollSessions(direction: -1 | 1) {
  const element = strip.value;
  if (!element) return;
  element.scrollBy({
    left: direction * Math.max(180, element.clientWidth * 0.6),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

onMounted(() => {
  resizeObserver = new ResizeObserver(updateScrollState);
  if (strip.value) resizeObserver.observe(strip.value);
  updateScrollState();
});
onBeforeUnmount(() => resizeObserver?.disconnect());
watch(
  () => props.sessions,
  async () => {
    await nextTick();
    resizeObserver?.disconnect();
    if (strip.value) resizeObserver?.observe(strip.value);
    updateScrollState();
  },
  { deep: true },
);
</script>

<template>
  <fieldset class="session-selector" :disabled="disabled" :aria-describedby="hintId">
    <div class="session-selector__header repel">
      <legend class="session-selector__legend">{{ legend }}</legend>
      <p :id="hintId" class="visually-hidden">
        Full sessions are unavailable. Choose an open date.
      </p>
      <div class="session-selector__controls cluster" aria-label="Session scrolling controls">
        <button
          type="button"
          class="session-selector__nav-btn"
          aria-label="Previous sessions"
          :disabled="disabled || !canScrollBack"
          @click="scrollSessions(-1)"
        >
          <AppIcon name="lucide:arrow-left" />
        </button>
        <button
          type="button"
          class="session-selector__nav-btn"
          aria-label="Next sessions"
          :disabled="disabled || !canScrollForward"
          @click="scrollSessions(1)"
        >
          <AppIcon name="lucide:arrow-right" />
        </button>
      </div>
    </div>

    <div
      v-if="sessions.length"
      ref="strip"
      class="session-selector__strip"
      @scroll.passive="updateScrollState"
    >
      <CourseSessionTile
        v-for="session in sessions"
        :key="session.id"
        v-model="model"
        :session="session"
        :name="groupName"
        :selected-variant="selectedVariant"
        :disabled="disabled"
      />
    </div>
    <p v-else class="u-text-muted">There are no sessions scheduled for this course yet.</p>
  </fieldset>
</template>

<style scoped>
@layer blocks {
  .session-selector {
    min-inline-size: 0;
    margin-inline: 0;
    padding: 0;
    border: 0;
  }

  .session-selector__header {
    --repel-align: center;
    margin-block-end: var(--space-400);
  }

  .session-selector__legend {
    padding: 0;
    color: var(--clr-text);
    font-size: 1.125rem;
    font-weight: var(--fw-regular);
    line-height: var(--lh-snug);
  }

  .session-selector__controls {
    --cluster-gap: var(--space-200);
  }

  .session-selector__nav-btn {
    --icon-size: 0.9375rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    padding: 0;
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    background-color: var(--clr-surface);
    color: var(--clr-text);
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      color var(--duration-fast) var(--ease-standard);

    &:hover:not(:disabled) {
      border-color: var(--clr-primary-500);
      color: var(--clr-primary-500);
    }

    &:disabled {
      color: var(--clr-text-subtle);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .session-selector__strip {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(9.5rem, 11.25rem);
    gap: var(--space-300);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    padding: var(--space-100);
    margin-inline: calc(var(--space-100) * -1);
    scroll-padding-inline: var(--space-100);
    scroll-snap-type: inline proximity;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
