<script setup lang="ts">
import Rooster from '@/assets/icons/icon-rooster.svg'
</script>

<template>
	<section class="HomeHero">
		<Rooster src="../assets/images/Rooster.svg" alt="" aria-hidden="true" :fontControlled="false" class="img" />
		<div class="main">
			<Typography tag="h1" variant="heading" class="">Harmony Rooster LLC</Typography>
			<Typography tag="h2" variant="heading-large">Providing <br />
				<span>Compassionate </span>
				<br />
				In-Home <span>Care</span>
			</Typography>
		</div>
		<div class="content">
			<Typography tag="p" variant="text-display">We offer compassionate, non-emergency in-home care services designed
				to
				promote independence, dignity, and overall well-being.</Typography>
			<div class="">
				<button class="btn-lg btn-primary">Contact us</button>
			</div>
		</div>
	</section>
</template>
