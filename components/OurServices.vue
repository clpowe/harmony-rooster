<script setup lang="ts">
	import type { Component } from 'vue'
	import Care from '@/assets/icons/icon-care.svg'
	import Cook from '@/assets/icons/icon-cook.svg'
	import Medication from '@/assets/icons/icon-medication.svg'

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
		}
	]
</script>
<template>
	<section class="card space-y-8 md:max-w-80">
		<div>
			<h2 class="header">Our <span>Services</span></h2>
			<p class="base-text"
				>Harmony Rooster, LLC is here to help. Our team of dedicated and
				qualified caregivers provides a helping hand with a variety of needs,
				including</p
			>
		</div>
		<ul class="flex flex-col gap-4">
			<li class="service-item" v-for="item in services">
				<div class="icon"> <component :is="item.icon" /> </div>
				<p>{{ item.text }}</p>
			</li>
		</ul>
		<p class="base-text"
			>We work closely with you and your loved one to create a personalized care
			plan that promotes self-reliance, personal growth, and a sense of
			fulfillment.</p
		>
	</section>
</template>

<style scoped>
	section {
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		background-color: var(--surface-2);
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	li {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;

		&:last-of-type {
			margin-bottom: 0;
		}

		.icon {
			background-color: var(--accent-500);
			color: white;
			font-size: 1.5rem;
			padding: 0.25rem;
			border-radius: 0.25rem;
		}
	}
</style>
