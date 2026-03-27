<template>
  <div>
    <main-header />
    <slot />
    <footer class="site-footer">Copyright © {{ new Date().getFullYear() }}</footer>
  </div>
</template>
