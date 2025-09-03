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
		text: 'Personal Support'
	},
	{
		icon: Cook,
		text: 'Respite'
	},
	{
		icon: Medication,
		text: 'Nursing'
	},
	{
		icon: Companion,
		text: 'Foster Home'
	}
]
</script>
<template>
	<div class="l-grid-1-2 card u-surface-2">
		<div class="content_wrapper">
			<Typography tag="h2" variant="heading-medium">Our <span>Services</span></Typography>
			<Typography tag="p" variant="text">Harmony Rooster, LLC is here to help. Our team of dedicated and
				qualified caregivers provides a helping hand with a variety of needs,
				including</Typography>
		</div>

    <ul class="services_wrapper">
      <li v-for="item in services" :key="item.text" class="service-item">
        <component :is="item.icon" class="icon" />
        <Typography tag="p" variant="text-large">{{ item.text }}</Typography>
      </li>
    </ul>
	</div>
</template>

<style scoped>

.content_wrapper {
	padding: var(--size-3);
}

.services_wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-3);
}

.service-item {
  display: grid;
  justify-content: center;
	background: var(--surface-1);
	padding: var(--size-3);
	border-radius: var(--radius-3);
  text-align: center;
  place-content: center;

	.icon {
    margin-inline: auto;
		font-size: var(--size-8);
		margin-bottom: var(--size-2);
	}
}
</style>
