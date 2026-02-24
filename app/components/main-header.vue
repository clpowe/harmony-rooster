<template>
    <header class="header">
        <NuxtLink to="/" class="logo" aria-label="Harmony Rooster — Home">
            <SvgoIconRoosterbg
                class="header__icon"
                filled
                :fontControlled="true"
                aria-hidden="true"
            />
        </NuxtLink>

        <button
            class="menu-toggle"
            type="button"
            popovertarget="mobile-menu"
            aria-haspopup="dialog"
            aria-label="Open navigation menu"
        >
            Menu
        </button>

        <nav class="desktop-nav" aria-label="Primary navigation">
            <ul>
                <li>
                    <NuxtLink class="menu-link">Our Services</NuxtLink>
                </li>
                <li>
                    <NuxtLink class="menu-link">About Us</NuxtLink>
                </li>
                <li>
                    <NuxtLink class="menu-link">Courses</NuxtLink>
                </li>
            </ul>
        </nav>
        <div class="header__actions desktop-actions">
            <button class="u-btn u-btn--md u-btn--primary">Let's Chat</button>
            <button class="u-btn u-btn--md u-btn--accent">813-888-8888</button>
        </div>
    </header>

    <div
        id="mobile-menu"
        class="mobile-drawer"
        popover
        role="dialog"
        aria-label="Mobile navigation"
    >
        <div class="mobile-drawer__header">
            <p class="mobile-drawer__title">Menu</p>
            <button
                class="mobile-drawer__close"
                type="button"
                popovertarget="mobile-menu"
                popovertargetaction="hide"
                aria-label="Close navigation menu"
            >
                Close
            </button>
        </div>

        <nav aria-label="Mobile navigation">
            <ul class="mobile-drawer__list">
                <li>
                    <NuxtLink class="menu-link">Our Services</NuxtLink>
                </li>
                <li>
                    <NuxtLink class="menu-link">About Us</NuxtLink>
                </li>
                <li>
                    <NuxtLink class="menu-link">Courses</NuxtLink>
                </li>
            </ul>
        </nav>

        <div class="header__actions mobile-drawer__actions">
            <button class="u-btn u-btn--md u-btn--primary">Lets Chat</button>
            <button class="u-btn u-btn--md u-btn--accent">813-888-8888</button>
        </div>
    </div>
</template>

<style scoped>
.header {
    width: 100%;
    max-width: 72rem;
    margin-inline: auto;
    padding: var(--size-1);
    display: flex;
    align-items: center;
}
.header__icon {
    font-size: 4rem;
    fill: var(--primary-500);
}
.header__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-left: 1rem;

    @media (min-width: 500px) {
        flex-direction: row;
    }
}

.logo {
    margin-right: auto;
}

.desktop-nav,
.desktop-actions {
    display: none;
}

.menu-toggle {
    border: 2px solid var(--text-1);
    color: var(--text-1);
    background: var(--surface-2);
    border-radius: 999px;
    padding: 0.45rem 0.9rem;
    min-height: 44px;
    font-size: 0.875rem;
    font-weight: 700;
}

ul {
    display: flex;
    align-items: center;
    list-style-type: none;
    padding: 0;
    margin: 0;
    gap: 1rem;

    li {
        display: flex;
    }
}

a {
    font-size: 0.875rem;
}

.menu-link {
    position: relative;
    display: inline-block;
    text-decoration: none;
    color: var(--text-1);
    transition: color 220ms ease;
}

.menu-link::after {
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

.menu-link:hover::after,
.menu-link:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
}

.menu-link:hover,
.menu-link:focus-visible {
    color: var(--primary-500);
}

.menu-toggle:focus-visible,
.menu-link:focus-visible,
.mobile-drawer__close:focus-visible {
    outline: 3px solid var(--primary-500);
    outline-offset: 3px;
}

.mobile-drawer {
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

.mobile-drawer:popover-open {
    opacity: 1;
    transform: translateX(0);

    @starting-style {
        transform: translateX(100%);
    }
}

.mobile-drawer::backdrop {
    background: rgb(0 0 0 / 0%);
    transition:
        background-color 260ms ease,
        display 260ms allow-discrete,
        overlay 260ms allow-discrete;
    transition-behavior: allow-discrete;
}

.mobile-drawer:popover-open::backdrop {
    background: rgb(0 0 0 / 72%);

    @starting-style {
        background: rgb(0 0 0 / 0%);
    }
}

.mobile-drawer__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
}

.mobile-drawer__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-1);
}

.mobile-drawer__close {
    border: 2px solid var(--text-1);
    color: var(--text-1);
    background: var(--surface-2);
    border-radius: 999px;
    padding: 0.4rem 0.75rem;
    min-height: 44px;
    font-size: 0.875rem;
    font-weight: 700;
}

.mobile-drawer__list {
    display: grid;
    gap: 1rem;
}

.mobile-drawer__actions {
    margin-left: 0;
    align-items: flex-start;
}

@media (min-width: 901px) {
    .menu-toggle,
    .mobile-drawer {
        display: none;
    }

    .desktop-nav {
        display: block;
    }

    .desktop-actions {
        display: flex;
    }
}

@media (prefers-reduced-motion: reduce) {
    .mobile-drawer,
    .mobile-drawer::backdrop,
    .menu-link,
    .menu-link::after {
        transition-duration: 0ms;
    }
}
</style>
