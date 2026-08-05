<script setup lang="ts">
import roosterFavicon from "@/assets/images/Favicon.svg?url";

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: roosterFavicon,
    },
  ],
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
