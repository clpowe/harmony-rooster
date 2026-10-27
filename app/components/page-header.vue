<script setup lang="ts">
const navId = "primary-nav";

const navLinks = [
  { label: "Our Services", to: "/#our-services" },
  { label: "About Us", to: "/#about-us" },
  { label: "Courses", to: "/#courses" },
  { label: "FAQ", to: "/#faq" },
];

const route = useRoute();
const isOpen = ref(false);

// Hash links all resolve to "/", so RouterLink's exact-active check would mark every one current.
const isCurrent = (to: string) => route.fullPath === to;

const closeNav = () => {
  isOpen.value = false;
};

watch(() => route.fullPath, closeNav);
</script>

<template>
  <header class="page-header" @keydown.esc="closeNav">
    <div class="wrapper page-header-layout">
      <NuxtLink to="/" class="logo" aria-label="Harmony Roosters home">
        <SvgoIconRooster class="logo-mark" :fontControlled="false" aria-hidden="true" />
        <SvgoIconWordmark class="logo-wordmark" filled :fontControlled="false" aria-hidden="true" />
      </NuxtLink>

      <button
        class="nav-toggle"
        type="button"
        :aria-controls="navId"
        :aria-expanded="isOpen ? 'true' : 'false'"
        @click="isOpen = !isOpen"
      >
        <AppIcon :name="isOpen ? 'lucide:x' : 'lucide:menu'" />
        <span class="visually-hidden">Menu</span>
      </button>

      <nav
        :id="navId"
        class="primary-nav"
        :data-state="isOpen ? 'open' : 'closed'"
        aria-label="Primary"
      >
        <ul role="list">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="nav-link"
              :aria-current="isCurrent(link.to) ? 'page' : undefined"
              @click="closeNav"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <div class="nav-actions cluster">
          <AppButton href="https://applynow.apd.myflorida.com/" @click="closeNav"
            >Apply now</AppButton
          >
          <AppButton href="tel:+18134340447" variant="accent">
            <template #icon-start><AppIcon name="lucide:phone" /></template>
            813-434-0447
          </AppButton>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
@layer blocks {
  /* Block · page-header */
  .page-header {
    padding-block: var(--space-400);
  }

  .page-header-layout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-400);
  }

  /* Block · logo */
  .logo {
    display: inline-flex;
    align-items: center;
    gap: var(--space-200);
    text-decoration: none;
    font-weight: var(--fw-bold);
    font-size: var(--text-caption);
    line-height: 1;
    text-transform: uppercase;
    color: var(--clr-primary-500);

    & svg,
    & img {
      inline-size: 2rem;
      block-size: auto;
    }

    & .logo-mark {
      fill: currentColor;
    }

    & .logo-wordmark {
      inline-size: auto;
      block-size: 2rem;
    }
  }

  /* Block · nav-toggle */
  .nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--touch-target);
    block-size: var(--touch-target);
    padding: 0;
    color: var(--clr-primary-500);
    background: var(--clr-surface);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-pill);
    cursor: pointer;
  }

  /* Block · primary-nav. Below 56em it collapses to a column under the logo row. */
  .primary-nav {
    flex-basis: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-400);

    &[data-state="closed"] {
      display: none;
    }

    &[data-state="open"] {
      display: flex;
    }

    & ul {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--touch-target);
    font-size: var(--text-caption);
    color: var(--clr-text);
    text-decoration: none;

    &:hover,
    &[aria-current="page"] {
      color: var(--clr-primary-500);
      text-decoration: underline;
      text-decoration-color: var(--clr-accent-400);
      text-decoration-thickness: 2px;
    }
  }

  @media (width >= 56em) {
    .nav-toggle {
      display: none;
    }

    .primary-nav,
    .primary-nav[data-state] {
      display: flex;
      flex-basis: auto;
      flex-direction: row;
      align-items: center;
      gap: var(--space-600);

      & ul {
        flex-direction: row;
        gap: var(--space-500);
      }
    }
  }
}
</style>
