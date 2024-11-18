<script setup lang="ts">
import type { Component } from 'vue'
import Care from '@/assets/icons/icon-care.svg'
import Cook from '@/assets/icons/icon-cook.svg'
import Medication from '@/assets/icons/icon-medication.svg'
import Companion from '@/assets/icons/icon-companion.svg'

type Service = {
	icon: typeof Care
	text: string
}

const services: Service[] = [
	{
		icon: Care,
		text: 'Personal care assistance'
	},
	{
		icon: Cook,
		text: 'Meal preparation and light housekeeping'
	},
	{
		icon: Medication,
		text: 'Medication reminders and management'
	},
	{
		icon: Companion,
		text: 'Companionship and social interaction'
	}
]
</script>
<template>
	<section class="card space-y-8 md:max-w-80">
		<div class="main">
			<Typography tag="h2" variant="heading-medium">Our <span>Services</span></Typography>
			<Typography tag="p" variant="text">Harmony Rooster, LLC is here to help. Our team of dedicated and
				qualified caregivers provides a helping hand with a variety of needs,
				including</Typography>
		</div>

		<div v-for="item in services" :key="item.text" class="service-item">
			<component :is="item.icon" class="icon" />
			<Typography tag="p" variant="text">{{ item.text }}</Typography>
		</div>
	</section>
</template>

<style scoped>
section {
	border-radius: var(--radius-lg);
	padding: var(--size-6);
	background-color: var(--surface-2);
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--size-3);
	row-gap: var(--size-3);
}

.main {
	padding: var(--size-3);
	grid-column: 1/-1;
}

.service-item {
	background: var(--surface-1);
	padding: var(--size-3);
	border-radius: var(--radius-3);

	.icon {
		font-size: var(--size-7);
		margin-bottom: var(--size-2);
	}
}

@media (min-width: 600px) {
	section {
		border-radius: var(--radius-lg);
		padding: var(--size-6);
		background-color: var(--surface-2);
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--size-3);
		row-gap: var(--size-6);
	}

	.main {
		grid-column: 1/3;
	}
}
</style>
