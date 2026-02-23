<script setup lang="ts">
import Care from "@/assets/icons/icon-care.svg";
import Cook from "@/assets/icons/icon-cook.svg";
import Medication from "@/assets/icons/icon-medication.svg";
import Companion from "@/assets/icons/icon-companion.svg";

type Service = {
    icon: typeof Care;
    title: string;
    text: string;
};

const services: Service[] = [
    {
        icon: Care,
        title: "Personal Support",
        text: "Help with daily living, companionship, and light household tasks.",
    },
    {
        icon: Cook,
        title: "Respite",
        text: "Short-term relief care to give primary caregivers a break.",
    },
    {
        icon: Medication,
        title: "Nursing",
        text: "Skilled medical care and health management at home.",
    },
    {
        icon: Companion,
        title: "Foster Home",
        text: "24/7 family-style living with personalized support.",
    },
];
</script>
<template>
    <div class="our-services card u-surface-2">
        <div class="content_wrapper">
            <Typography tag="h2" variant="heading-medium"
                >Our <span>Services</span></Typography
            >
            <Typography tag="p" variant="text"
                >Harmony Rooster, LLC is here to help. Our team of dedicated and
                qualified caregivers provides a helping hand with a variety of
                needs, including</Typography
            >
        </div>

        <ul class="services-wrapper">
            <li v-for="item in services" :key="item.title" class="service-item">
                <component :is="item.icon" class="icon" />
                <Typography tag="p" variant="text">{{ item.title }}</Typography>
                <Typography tag="p" variant="text">{{ item.text }}</Typography>
            </li>
        </ul>
    </div>
</template>

<style scoped>
ul {
    list-style: none;
}

.our-services {
    display: grid;
    gap: var(--space-lg);
}

.content_wrapper {
}

.our-services h2 {
    margin-bottom: var(--space-xxxs);
}

.services-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-sm);
}

.service-item {
    display: grid;
    background: var(--surface-1);
    padding: var(--space-sm);
    border-radius: var(--radius-3);
    border: 1px solid var(--neutral-200);

    .icon {
        font-size: var(--size-8);
        margin-bottom: var(--space-xs);
    }
}
</style>
