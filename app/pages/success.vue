<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const sessionId = ref(route.query.session_id as string);

if (!sessionId.value) {
    await navigateTo("/");
}

// Fetch checkout data immediately when page loads
const {
    data: checkoutData,
    error,
    pending,
} = await useFetch("/api/stripe/success", {
    query: { session_id: sessionId.value },
    server: true,
    immediate: true,
});

const { data: courses } = useNuxtData("courses");

// Handle errors
if (error.value) {
    console.error("Failed to load checkout data:", error.value);
}
</script>
<template>
    <div v-if="checkoutData?.status === 'paid'">
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase.</p>
    </div>
    <div v-else>
        <h1>Payment Pending or Failed</h1>
    </div>
    <div>
        <pre>{{ checkoutData }}</pre>
    </div>
</template>
