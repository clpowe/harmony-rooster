<script setup>
	import Rooster from '../assets/images/Rooster.svg'
	import Care from '../assets/images/Care.svg'
	import Cook from '../assets/images/Cook.svg'
	import Medication from '../assets/images/Medication.svg'
</script>

<template>
	<main class="max-w-6xl mx-auto p-4 md:p-8">
		<section class="flex flex-col gap-4 md:gap-8 relative mb-12">
			<img
				:src="Rooster"
				alt=""
				height="150"
				class="left-3/4 md:block h-48 absolute md:h-60 md:left-1/4 md:bottom-12 -z-10 opacity-60"
			/>
			<div class="justify-start max-w-[75ch] text-slate-700">
				<p class="uppercase text-base md:text-xl mb-2">Harmony Rooster LLC</p>
				<h1 class="!leading-[0.9em] text-wrap md:text-balance uppercase"
					>Providing <br />
					<span class="text-primary">Compassionate </span>
					<br />
					In-Home <span class="text-accent">Care</span></h1
				>
			</div>
			<div
				class="justify-start md:ml-[50%] flex flex-col gap-4 md:gap-8 md:self-end"
			>
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

		<div class="flex flex-col gap-8 md:flex-row mb-12">
			<section class="bg-white rounded-2xl p-8 space-y-8 md:max-w-80">
				<div>
					<h2 class="mb-4">Our <span>Services</span></h2>
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

			<section class="p-8 space-y-4 overflow-hidden">
				<h2 class="mb-4">Meet our <span>team</span></h2>
				<p class=""
					>Our caregivers are not just qualified; they are compassionate and
					dedicated to making a difference in the lives of our clients. They
					undergo rigorous background checks, training, and ongoing education to
					ensure they provide the highest quality of care.</p
				>
				<ul class="flex gap-4 pt-6 overflow-x-scroll">
					<li>
						<article class="p-4 bg-white rounded-md w-72">
							<img
								src="https://picsum.photos/200"
								alt=""
								class="w-full rounded-md mb-4"
							/>
							<h3 class="font-bold text-xl mb-0">Derek Robinson</h3>
							<p class="text-accent mb-2">President/Owner</p>
							<p
								>With over 14+ years of experience in the medical field, Derek
								leads our team with expertise and compassion</p
							>
						</article>
					</li>
					<li>
						<article class="p-4 bg-white rounded-md w-72">
							<img
								src="https://picsum.photos/500"
								alt=""
								class="w-full rounded-md mb-4"
							/>
							<h3 class="font-bold text-xl mb-0">Derek Robinson</h3>
							<p class="text-accent mb-2">President/Owner</p>
							<p
								>With over 14+ years of experience in the medical field, Derek
								leads our team with expertise and compassion</p
							>
						</article>
					</li>
					<li>
						<article
							class="p-8 bg-primary rounded-md w-72 h-full grid place-content-center text-center"
						>
							<p class="text-white text-5xl"> JOIN OUR TEAM </p>
						</article>
					</li>
				</ul>
			</section>
		</div>

		<section
			class="bg-white rounded-2xl p-8 flex gap-4 flex-col md:flex-row relative overflow-hidden mb-12"
		>
			<img src="https://picsum.photos/200" alt="" class="rounded-lg" />
			<div class="max-w-xl p-4 z-10">
				<h2 class="mb-4">About <span>Us</span></h2>
				<p class="max-w-[75ch]">
					Harmony Rooster, LLC is a locally owned and operated company based in
					Tampa, Florida. The company was founded by [Owner Names], who are
					passionate about providing exceptional in-home care services that
					empower individuals to live their best lives.</p
				>
			</div>
			<img
				src="../assets/images/roosterbg.svg"
				alt=""
				class="absolute -bottom-60 md:-bottom-36 right-0 z-0"
			/>
		</section>

		<section class="bg-white rounded-2xl p-8 flex faq">
			<div>
				<h2>Frequently Asked <span>Questions</span></h2>
				<p>Find answers to common questions about our services</p>
			</div>
			<div>
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
			</div>
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
	h1 {
		line-break: auto;
		font-size: clamp(2rem, 10vw, 6rem);
	}

	h2 {
		font-size: clamp(1.8rem, 5vw, 3rem);
		line-height: 1em;
		@apply uppercase;

		span {
			@apply text-primary;
		}
	}

	p {
		@apply text-slate-500;
		max-width: 75ch;
	}

	.service-item {
		@apply flex gap-4;

		.icon {
			@apply min-h-12 min-w-12 max-h-12 max-w-12 p-2 rounded bg-accent grid place-content-center;
		}
	}

	main {
		container-type: inline-size;
		container-name: main;
	}

	.faq {
		display: flex;
		flex-direction: column;
	}

	@container main (inline-size > 65ch) {
		.faq {
			flex-direction: row;
			background-color:;
		}
	}
</style>
