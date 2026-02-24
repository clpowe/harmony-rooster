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
    <section
        id="our-services"
        class="our-services card u-surface-2"
        aria-labelledby="our-services-title"
    >
        <div class="content_wrapper">
            <Typography
                tag="h2"
                variant="heading-medium"
                id="our-services-title"
                >Our <span>Services</span></Typography
            >
            <Typography tag="p" variant="text" id="our-services-intro"
                >Harmony Rooster, LLC is here to help. Our team of dedicated and
                qualified caregivers provides a helping hand with a variety of
                needs, including:</Typography
            >
        </div>

        <ul class="services-wrapper" aria-describedby="our-services-intro">
            <li
                v-for="(item, idx) in services"
                :key="item.title"
                class="service-item"
            >
                <div class="title">
                    <component
                        :is="item.icon"
                        class="icon"
                        aria-hidden="true"
                        focusable="false"
                    />
                    <Typography
                        tag="h3"
                        variant="heading-small"
                        :id="`service-title-${idx}`"
                        >{{ item.title }}</Typography
                    >
                </div>
                <Typography
                    tag="p"
                    variant="text"
                    :id="`service-desc-${idx}`"
                    >{{ item.text }}</Typography
                >
            </li>
        </ul>
    </section>
</template>

<style scoped>
ul {
    list-style: none;
}

.our-services {
    display: grid;
    gap: var(--space-lg);
    grid-template-columns: 1fr;

    @media (min-width: 1000px) {
        grid-template-columns: minmax(400px, 1fr) auto;
    }
}

.our-services h2 {
    margin-bottom: var(--space-xxxs);
}

.services-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-md);

    @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }
}

.service-item {
    display: grid;
    background: var(--surface-1);
    padding: var(--space-sm);
    border-radius: var(--radius-3);
    gap: var(--space-sm);

    .title {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: var(--space-xs);
    }

    .icon {
        font-size: var(--size-8);
        margin: 0;
    }
}
</style>
