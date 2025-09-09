<template>
  <div>
    <header class="header">
      <SvgoIconRoosterbg class="header__icon" filled :fontControlled="true" />

      <div class="header__actions">
        <button class="u-btn u-btn--lg u-btn--primary">Lets Chat</button>
        <button class="u-btn u-btn--lg u-btn--accent">813-888-8888</button>
      </div>
    </header>
    <slot />
    <footer> Copyright © {{ new Date().getFullYear() }} </footer>
  </div>
</template>
