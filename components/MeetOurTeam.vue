<template>
	<section class="p-4 md:p-8 space-y-4 overflow-hidden">
		<h2 class="header">Meet our <span>team</span></h2>
		<p class="base-text"
			>Our caregivers are not just qualified; they are compassionate and
			dedicated to making a difference in the lives of our clients. They undergo
			rigorous background checks, training, and ongoing education to ensure they
			provide the highest quality of care.</p
		>
		<ul class="flex gap-4 pt-6 overflow-x-scroll">
			<li v-for="s in staff" :key="s.id">
				<article class="p-4 bg-white rounded-md w-72">
					<img :src="s.picture" alt="" class="w-full rounded-md mb-4" />
					<h3 class="font-bold text-xl mb-0">{{ s.name }}</h3>
					<p class="text-accent mb-2">{{ s.title }}</p>
					<p>{{ s.description }}</p>
				</article>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
	type Staff = {
		id: string
		name: string
		title: string
		description: string
		picture: string
	}

	const staff: Staff[] = [
		{
			id: '1',
			name: 'Derek Robinson',
			title: 'President/Owner',
			description:
				'With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion',
			picture: '/Placeholder.jpg'
		},
		{
			id: '2',
			name: 'Cynthia Robinson',
			title: 'Administrator',
			description:
				'With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion',
			picture: '/Placeholder.jpg'
		}
	]
</script>

<style scoped>
	section {
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}
	ul {
		display: flex;
		gap: 1rem;
		overflow: hidden;
	}

	li {
		list-style: none;
		padding: 0;
		margin: 0;
		background-color: var(--surface-2);
		padding: 1rem;
		border-radius: var(--radius-lg);
		width: 15rem;

		img {
			height: 12rem;
			width: 12rem;
		}
	}
</style>
