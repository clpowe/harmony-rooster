<template>
	<section class="">
		<Typography tag="h2" variant="heading-medium">Meet our <span>team</span></Typography>
		<Typography tag="p" varient="text">Our caregivers are not just qualified; they are compassionate and
			dedicated to making a difference in the lives of our clients. They undergo
			rigorous background checks, training, and ongoing education to ensure they
			provide the highest quality of care.</Typography>
		<ul class="horizontal-media-scroller">
			<li v-for="s in staff" :key="s.id">
				<figure class="">
					<NuxtImg format="webp" loading="lazy" :src="s.picture" :alt="`A picture of ${s.name} }}`" class="" />
					<figcaption>
						<h3 class="font-bold text-xl mb-0">{{ s.name }}</h3>
						<p class="title">{{ s.title }}</p>
						<p>{{ s.description }}</p>
					</figcaption>
				</figure>
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
	},
	{
		id: '3',
		name: 'Cynthia Robinson',
		title: 'Administrator',
		description:
			'With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion',
		picture: '/Placeholder.jpg'
	},
	{
		id: '4',
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
	overflow: hidden;
}

.horizontal-media-scroller {
	--size: 260px;
	--gap: 2rem;

	display: grid;
	grid-auto-flow: column;
	grid-template-rows: 2fr;
	gap: calc(var(--gap) / 2);
	margin: 0;

	padding-inline-start: var(--gap);
	padding-inline-end: var(--gap);
	padding-block-start: calc(var(--gap) / 2);
	padding-block: calc(var(--gap) / 2);

	overflow-x: auto;
	overscroll-behavior-inline: contain;
	scroll-snap-type: inline mandatory;
	scroll-padding-left: var(--gap);
	scroll-padding-right: var(--gap);
	scroll-padding-inline: var(--gap);

	@media (prefers-reduced-motion: no-preference) {
		scroll-behavior: smooth;
	}

	&>li {
		min-width: var(--size);
		display: inline-block;

		&:last-of-type figure {
			position: relative;

			&::after {
				content: '';
				position: absolute;

				inline-size: var(--gap);
				block-size: 100%;

				inset-block-start: 0;
				inset-inline-end: calc(var(--gap) * -1);
			}
		}
	}

	& figure {
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
