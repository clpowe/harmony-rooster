<script setup>
	import Rooster from '../assets/images/Rooster.svg'
	import Care from '../assets/images/Care.svg'
	import Cook from '../assets/images/Cook.svg'
	import Medication from '../assets/images/Medication.svg'
</script>

<template>
	<main class="container p-4 md:p-8 space-y-8 md:space-y-12">
		<section class="flex flex-col gap-4 md:gap-8 relative">
			<img
				:src="Rooster"
				alt=""
				height="150"
				class="left-3/4 md:block h-48 absolute md:left-1/4 md:bottom-12 -z-10 opacity-60"
			/>
			<div
				class="max-w-[40ch] md:max-w-[55ch] justify-start xl:max-w-[75ch] text-slate-700"
			>
				<p class="uppercase text-base md:text-xl mb-2">Harmony Rooster LLC</p>
				<h1
					class="!leading-[0.9em] text-3xl text-balance uppercase md:text-7xl xl:text-8xl"
					>Providing <span class="text-primary">Compassionate</span> In-Home
					<span class="text-accent">Care</span></h1
				>
			</div>
			<div class="justify-start md:ml-[50%] flex flex-col gap-4 md:gap-8">
				<p
					class="italic text-slate-500 max-w-md text-sm sm:text-sm md:text-xl md:max-w-lg"
					>We offer compassionate, non-emergency in-home care services designed
					to promote independence, dignity, and overall well-being.</p
				>
				<div class="flex gap-4 flex-wrap">
					<Button size="sm">Contact us</Button>
					<Button size="sm" variant="outline">Free Consoltation</Button>
				</div>
			</div>
		</section>

		<div class="flex flex-col gap-8 md:flex-row">
			<section class="bg-white rounded-2xl p-8 space-y-8 md:max-w-80">
				<div>
					<h2 class="mb-4">Our <span class="text-primary">Services</span></h2>
					<p
						>Harmony Rooster, LLC is here to help. Our team of dedicated and
						qualified caregivers provides a helping hand with a variety of
						needs, including</p
					>
				</div>
				<ul class="flex flex-col gap-4">
					<li class="service-item">
						<div class="icon">
							<img :src="Care" alt="" />
						</div>
						<p> Personal care assistance </p>
					</li>
					<li class="service-item">
						<div class="icon">
							<img :src="Cook" alt="" />
						</div>
						<p> Meal preparation and light housekeeping </p>
					</li>
					<li class="service-item">
						<div class="icon">
							<img :src="Medication" alt="" />
						</div>
						<p> Medication reminders and management </p>
					</li>
				</ul>
				<p
					>We work closely with you and your loved one to create a personalized
					care plan that promotes self-reliance, personal growth, and a sense of
					fulfillment.</p
				>
			</section>

			<section>
				<h2>Meet our team</h2>
				<p
					>Our caregivers are not just qualified; they are compassionate and
					dedicated to making a difference in the lives of our clients. They
					undergo rigorous background checks, training, and ongoing education to
					ensure they provide the highest quality of care.</p
				>
				<ul>
					<li>
						<article>
							<img src="https://picsum.photos/200" alt="" />
							<h3>John Doe</h3>
							<p>Caregiver</p>
							<p
								>With over 14+ years of experience in the medical field, Derek
								leads our team with expertise and compassion</p
							>
						</article>
					</li>
					<li>
						<article>
							<img src="https://picsum.photos/200" alt="" />
							<h3>John Doe</h3>
							<p>Caregiver</p>
							<p
								>With over 14+ years of experience in the medical field, Derek
								leads our team with expertise and compassion</p
							>
						</article>
					</li>
				</ul>
			</section>
		</div>

		<section>
			<img src="https://picsum.photos/200" alt="" />
			<h2>About Us</h2>
			<p
				>Harmony Rooster, LLC is a locally owned and operated company based in
				Tampa, Florida. The company was founded by [Owner Names], who are
				passionate about providing exceptional in-home care services that
				empower individuals to live their best lives.</p
			>
		</section>

		<section>
			<h2>Frequently Asked Questions</h2>
			<p>Find answers to common questions about our services</p>
			<ul>
				<li>
					<h3>How can I get started?</h3>
					<p
						>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
						Recusandae, asperiores mollitia, quas aut temporibus tempora
						eligendi quos consequuntur fuga vel hic dolore expedita, provident
						officiis architecto soluta impedit! Consectetur, non!</p
					>
				</li>
				<li>
					<h3>How can I get started?</h3>
					<p
						>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
						Recusandae, asperiores mollitia, quas aut temporibus tempora
						eligendi quos consequuntur fuga vel hic dolore expedita, provident
						officiis architecto soluta impedit! Consectetur, non!</p
					>
				</li>
				<li>
					<h3>How can I get started?</h3>
					<p
						>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
						Recusandae, asperiores mollitia, quas aut temporibus tempora
						eligendi quos consequuntur fuga vel hic dolore expedita, provident
						officiis architecto soluta impedit! Consectetur, non!</p
					>
				</li>
				<li>
					<h3>How can I get started?</h3>
					<p
						>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
						Recusandae, asperiores mollitia, quas aut temporibus tempora
						eligendi quos consequuntur fuga vel hic dolore expedita, provident
						officiis architecto soluta impedit! Consectetur, non!</p
					>
				</li>
				<li>
					<h3>How can I get started?</h3>
					<p
						>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
						Recusandae, asperiores mollitia, quas aut temporibus tempora
						eligendi quos consequuntur fuga vel hic dolore expedita, provident
						officiis architecto soluta impedit! Consectetur, non!</p
					>
				</li>
			</ul>
		</section>

		<section>
			<h2>Contact Us</h2>
			<p>have a question? We’re here to help!</p>

			<form action="">
				<label for="name">Name</label>
				<input type="text" name="name" id="name" />
				<label for="email">Email</label>
				<input type="email" name="email" id="email" />
				<label for="message">Message</label>
				<textarea name="message" id="message"></textarea>
				<button type="submit">Submit</button>
			</form>
		</section>
	</main>
</template>

<style>
	h2 {
		@apply uppercase text-4xl xl:text-5xl;
	}

	p {
		@apply text-slate-500;
	}

	.service-item {
		@apply flex gap-4;

		.icon {
			@apply min-h-12 min-w-12 max-h-12 max-w-12 p-2 rounded bg-accent grid place-content-center;
		}
	}
</style>
