<script setup lang="ts">
const mobileMenuId = "mobile-menu";

const navLinks = [
  { label: "Our Services", to: "/#our-services" },
  { label: "About Us", to: "/#about-us" },
  { label: "Courses", to: "/#courses" },
];

const closeMobileMenu = () => {
  if (!import.meta.client) return;

  const menu = document.getElementById(mobileMenuId) as
    | (HTMLElement & { hidePopover?: () => void })
    | null;
  menu?.hidePopover?.();
};
</script>

<template>
  <header class="site-header">
    <SiteBrand class="site-header__brand" aria-label="Harmony Rooster home" />

    <button
      class="site-header__toggle"
      type="button"
      :popovertarget="mobileMenuId"
      aria-haspopup="dialog"
      aria-label="Open navigation menu"
    >
      Menu
    </button>

    <nav class="site-header__nav" aria-label="Primary navigation">
      <ul class="site-header__list">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" class="site-header__link">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="site-header__actions site-header__actions--desktop">
      <NuxtLink class="button button--md button--primary" to="/#contact">Let's Chat</NuxtLink>
      <a class="button button--md button--accent" href="tel:+18138888888">813-888-8888</a>
    </div>
  </header>

  <div
    :id="mobileMenuId"
    class="site-header__drawer"
    popover
    role="dialog"
    aria-label="Mobile navigation"
  >
    <div class="site-header__drawer-header">
      <p class="site-header__drawer-title">Menu</p>
      <button
        class="site-header__drawer-close"
        type="button"
        :popovertarget="mobileMenuId"
        popovertargetaction="hide"
        aria-label="Close navigation menu"
      >
        Close
      </button>
    </div>

    <nav aria-label="Mobile navigation">
      <ul class="site-header__drawer-list">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" class="site-header__link" @click="closeMobileMenu">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="site-header__actions site-header__actions--drawer">
      <NuxtLink class="button button--md button--primary" to="/#contact" @click="closeMobileMenu">
        Let's Chat
      </NuxtLink>
      <a class="button button--md button--accent" href="tel:+18138888888" @click="closeMobileMenu">
        813-888-8888
      </a>
    </div>
  </div>
</template>

<style scoped>
.site-header {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
  padding-block: clamp(1rem, 2.5vw, 1.5rem);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.site-header__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-left: var(--space-sm);

  @media (min-width: 500px) {
    flex-direction: row;
  }
}

.site-header__brand {
  --site-brand-wordmark-width: clamp(9.8rem, 20vw, 12.25rem);

  margin-right: auto;
}

.site-header__nav,
.site-header__actions--desktop {
  display: none;
}

.site-header__toggle {
  border: 2px solid var(--text-1);
  color: var(--text-1);
  background: var(--surface-2);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.site-header__list {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1rem;
}

.site-header__list li {
  display: flex;
}

.site-header__link {
  font-size: 0.875rem;
  position: relative;
  display: inline-block;
  text-decoration: none;
  color: var(--text-1);
  transition: color 220ms ease;
}

.site-header__link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.2rem;
  width: 100%;
  height: 2px;
  background: var(--accent-500);
  opacity: 0;
  transform: translateY(-6px);
  transition:
    transform 220ms ease-out,
    opacity 220ms ease;
}

.site-header__link:hover::after,
.site-header__link:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.site-header__link:hover,
.site-header__link:focus-visible {
  color: var(--primary-500);
}

.site-header__toggle:focus-visible,
.site-header__link:focus-visible,
.site-header__drawer-close:focus-visible {
  outline: 3px solid var(--primary-500);
  outline-offset: 3px;
}

.site-header__drawer {
  inset: 0 0 0 auto;
  margin: 0;
  width: min(92vw, 24rem);
  height: 100dvh;
  border: none;
  border-left: 1px solid var(--neutral-200);
  background: var(--surface-2);
  color: var(--text-1);
  padding: 1rem;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1.25rem;
  transform: translateX(100%);
  transition:
    transform 260ms ease,
    display 260ms allow-discrete,
    overlay 260ms allow-discrete;
  transition-behavior: allow-discrete;
}

.site-header__drawer:popover-open {
  opacity: 1;
  transform: translateX(0);

  @starting-style {
    transform: translateX(100%);
  }
}

.site-header__drawer::backdrop {
  background: rgb(0 0 0 / 0%);
  transition:
    background-color 260ms ease,
    display 260ms allow-discrete,
    overlay 260ms allow-discrete;
  transition-behavior: allow-discrete;
}

.site-header__drawer:popover-open::backdrop {
  background: rgb(0 0 0 / 72%);

  @starting-style {
    background: rgb(0 0 0 / 0%);
  }
}

.site-header__drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.site-header__drawer-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-1);
}

.site-header__drawer-close {
  border: 2px solid var(--text-1);
  color: var(--text-1);
  background: var(--surface-2);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.site-header__drawer-list {
  display: grid;
  gap: 1rem;
  list-style: none;
}

.site-header__actions--drawer {
  margin-left: 0;
  align-items: flex-start;
}

@media (min-width: 901px) {
  .site-header__toggle,
  .site-header__drawer {
    display: none;
  }

  .site-header__nav {
    display: block;
  }

  .site-header__actions--desktop {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header__drawer,
  .site-header__drawer::backdrop,
  .site-header__link,
  .site-header__link::after {
    transition-duration: 0ms;
  }
}
</style>
