<template>
  <div>
    <main-header />
    <slot />
    <footer class="site-footer">
      Copyright © {{ new Date().getFullYear() }} Harmony Roosters LLC
    </footer>
  </div>
</template>
