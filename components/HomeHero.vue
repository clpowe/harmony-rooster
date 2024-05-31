<script setup lang="ts">
	import Rooster from '@/assets/icons/icon-rooster.svg'
</script>

<template>
	<section class="HomeHero">
		<Rooster
			src="../assets/images/Rooster.svg"
			alt=""
			aria-hidden="true"
			:fontControlled="false"
			class="img"
		/>
		<div class="main">
			<h1 class="">Harmony Rooster LLC</h1>
			<h2
				>Providing <br />
				<span>Compassionate </span>
				<br />
				In-Home <span>Care</span></h2
			>
		</div>
		<div class="content">
			<p
				>We offer compassionate, non-emergency in-home care services designed to
				promote independence, dignity, and overall well-being.</p
			>
			<div class="">
				<button class="btn-lg btn-primary">Contact us</button>
			</div>
		</div>
	</section>
</template>
