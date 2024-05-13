<script setup lang="ts">
	type Item = {
		icon: string
		text: string
	}

	defineProps<{
		text: string
		items: Item[]
		subText: string
	}>()
</script>
<template>
	<section class="bg-white rounded-2xl p-8 space-y-8 md:max-w-80">
		<div>
			<h2 class="mb-4">Our <span>Services</span></h2>
			<p>{{ text }}</p>
		</div>
		<ul class="flex flex-col gap-4">
			<li class="service-item" v-for="item in items">
				<div class="icon">
					<img :src="item.icon" alt="" />
				</div>
				<p>{{ item.text }}</p>
			</li>
		</ul>
		<p>{{ subText }}</p>
	</section>
</template>

<style scoped></style>
