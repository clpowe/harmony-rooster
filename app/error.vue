<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const router = useRouter();

const statusCode = computed(() => props.error?.statusCode ?? 500);

const errorVariant = computed(() => {
  if (statusCode.value === 404) {
    return {
      title: "Error",
      message: "The page you are looking for doesn’t exist or another error occurred",
      primaryLabel: "Go Back",
    };
  }

  return {
    title: "Something Went Wrong",
    message: "Another error occurred while loading this page. Please try again or return home.",
    primaryLabel: "Go Back",
  };
});

const handlePrimaryAction = async () => {
  if (import.meta.client && window.history.length > 1) {
    await router.back();
    return;
  }

  await clearError({ redirect: "/" });
};
</script>

<template>
  <ErrorScreen
    :status-code="statusCode"
    :title="errorVariant.title"
    :message="errorVariant.message"
    :primary-label="errorVariant.primaryLabel"
    @primary="handlePrimaryAction"
  />
</template>
