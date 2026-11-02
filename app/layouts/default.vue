<template>
  <div>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <page-header />
    <div id="main-content" tabindex="-1">
      <slot />
    </div>
    <page-footer />
  </div>
</template>

<style scoped>
@layer blocks {
  .skip-link {
    position: absolute;
    inset-block-start: var(--space-200);
    inset-inline-start: var(--space-200);
    z-index: 10;
    padding: var(--space-200) var(--space-400);
    color: var(--clr-neutral-100);
    background: var(--clr-primary-500);
    border-radius: var(--radius-pill);
    transform: translateY(-200%);

    &:focus-visible {
      transform: none;
    }
  }

  #main-content:focus {
    outline: none;
  }
}
</style>
