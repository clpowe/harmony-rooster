<script setup lang="ts">
const open = defineModel<boolean>({ default: false });

defineProps<{ label: string }>();

const dialog = ref<HTMLDialogElement | null>(null);

watch(open, (isOpen) => {
  const el = dialog.value;
  if (!el) return;
  if (isOpen && !el.open) el.showModal();
  if (!isOpen && el.open) el.close();
});

// Native close (Esc) keeps the model in sync.
const onClose = () => {
  open.value = false;
};

// A click on the dialog box itself (not its content) lands on the backdrop area.
const onClick = (event: MouseEvent) => {
  if (event.target === dialog.value) open.value = false;
};
</script>

<template>
  <dialog ref="dialog" class="nav-dialog" :aria-label="label" @close="onClose" @click="onClick">
    <div class="nav-dialog-body flow">
      <div class="nav-dialog-close">
        <AppIconButton label="Close menu" icon="lucide:x" @click="open = false" />
      </div>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
@layer blocks {
  .nav-dialog {
    inline-size: min(100% - var(--wrapper-gutter) * 2, 32rem);
    max-block-size: calc(100dvh - var(--space-600));
    margin: var(--space-400) auto auto;
    padding: 0;
    overflow: auto;
    color: var(--clr-text);
    background-color: var(--clr-surface);
    border: 0;
    border-radius: var(--radius-panel);
    box-shadow: var(--shadow-200);

    --slide-duration: calc(var(--duration-base) * 2);
    --slide-ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Exit state */
    transform: translateY(calc(-100% - var(--space-400)));
    transition:
      transform var(--slide-duration) var(--slide-ease),
      display var(--slide-duration) allow-discrete,
      overlay var(--slide-duration) allow-discrete;

    &[open] {
      transform: none;
    }

    @starting-style {
      &[open] {
        transform: translateY(calc(-100% - var(--space-400)));
      }
    }

    &::backdrop {
      background-color: oklch(21.46% 0 0 / 0.55);
      opacity: 0;
      transition:
        opacity var(--slide-duration) var(--slide-ease),
        display var(--slide-duration) allow-discrete,
        overlay var(--slide-duration) allow-discrete;
    }

    &[open]::backdrop {
      opacity: 1;
    }

    @starting-style {
      &[open]::backdrop {
        opacity: 0;
      }
    }
  }

  .nav-dialog-body {
    --flow-space: var(--space-400);
    padding: var(--space-500);
  }

  .nav-dialog-close {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
