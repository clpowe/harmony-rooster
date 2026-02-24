<script setup lang="ts">
import Rooster from "@/assets/icons/icon-rooster.svg";
</script>

<template>
    <section class="homehero">
        <Rooster
            src="../assets/images/Rooster.svg"
            alt=""
            aria-hidden="true"
            :fontControlled="false"
            class="homehero__img"
        />
        <div class="homehero__main">
            <Typography tag="h1" variant="heading" uppercase class=""
                >Harmony Rooster LLC</Typography
            >
            <Typography tag="h2" uppercase variant="heading-large"
                >Providing <br />
                <span>Compassionate </span>
                <br />
                In-Home <span>Care</span>
            </Typography>
        </div>
        <div class="homehero__content">
            <Typography tag="p" variant="text"
                >We offer compassionate, non-emergency in-home care services
                designed to promote independence, dignity, and overall
                well-being.</Typography
            >
            <div class="">
                <button class="u-btn u-btn--lg u-btn--primary">
                    Contact us
                </button>
            </div>
        </div>
    </section>
</template>

<style>

</style>