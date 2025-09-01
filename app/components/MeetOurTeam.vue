<template>
	<div class="">
		<Typography tag="h2" variant="heading-medium">Our <span>team</span></Typography>
		<Typography tag="p" variant="text">Our caregivers are not just qualified; they are compassionate and
			dedicated to making a difference in the lives of our clients. They undergo
			rigorous background checks, training, and ongoing education to ensure they
			provide the highest quality of care.</Typography>
		<!-- <ul>
			<li v-for="s in staff" :key="s.id">
				<figure class="">
					<NuxtImg format="webp" loading="lazy" :src="s.picture" :alt="`A picture of ${s.name} }}`" class="" />
					<figcaption>
						<Typography tag="h3" variant="heading">{{ s.name }}</Typography>
						<Typography tag="p" variant="text" class="title">{{ s.title }}</Typography>
						<Typography tag="p" variant="text">{{ s.description }}</Typography>
					</figcaption>
				</figure>
			</li>
		</ul> -->
	</div>
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
	},
	{
		id: '3',
		name: 'Cynthia Robinson',
		title: 'Administrator',
		description:
			'With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion',
		picture: '/Placeholder.jpg'
	},
]
</script>

<style scoped>
section {
	border-radius: var(--radius-lg);
	padding: 1.5rem;
}


ul {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--size-3);
	list-style: none;
}

figure {
	scroll-snap-align: start;
	background-color: var(--surface-2);
	border-radius: var(--radius-sm);
	padding: 1rem;
	display: grid;
	place-content: center;

	gap: 0.5rem;

	& figcaption {
		display: grid;

		& h3 {
			font-size: 20px;
			font-weight: bold;
		}

		& .title {
			color: var(--accent-500);
			margin-bottom: 0.5rem;
		}
	}
}

img {
	inline-size: 100%;
	block-size: 100%;

	object-fit: cover;
	border-radius: 1ex;
	overflow: hidden;

	background-image: linear-gradient(to bottom, hsl(0 0% 40%), hsl(0 0% 20%));
}
</style>
