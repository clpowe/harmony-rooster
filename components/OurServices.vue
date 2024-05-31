<script setup lang="ts">
	import Care from '../assets/images/Care.svg'
	import Cook from '../assets/images/Cook.svg'
	import Medication from '../assets/images/Medication.svg'
	type Service = {
		icon: string
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
				<div class="icon">
					<img :src="item.icon" alt="" aria-hidden="true" />
				</div>
				<p>{{ item.text }}</p>
			</li>
		</ul>
		<p
			>We work closely with you and your loved one to create a personalized care
			plan that promotes self-reliance, personal growth, and a sense of
			fulfillment.</p
		>
	</section>
</template>

<style scoped></style>
