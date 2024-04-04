<template>
	<main class="container">
		<section class="flex flex-col gap-8">
			<div
				class="max-w-[25ch] md:max-w-[55ch] justify-start xl:max-w-[75ch] text-slate-600"
			>
				<p class="uppercase">Harmony Rooster LLC</p>
				<h1
					class="!leading-[0.9em] text-4xl text-balance uppercase md:text-7xl xl:text-8xl"
					>Providing <span class="text-primary">Compassionate</span> In-Home
					<span class="text-accent">Care</span></h1
				>
			</div>
			<div class="justify-start md:self-end flex flex-col gap-8">
				<p class="italic text-slate-400 max-w-md leading-6"
					>We offer compassionate, non-emergency in-home care services designed
					to promote independence, dignity, and overall well-being.</p
				>
				<div class="flex gap-4 flex-wrap">
					<Button>Contact us</Button>
					<Button variant="outline">Free Consoltation</Button>
				</div>
			</div>
		</section>

		<section>
			<h2>Our Services</h2>
			<p
				>Harmony Rooster, LLC is here to help. Our team of dedicated and
				qualified caregivers provides a helping hand with a variety of needs,
				including</p
			>
			<ul>
				<li>Personal care assistance </li>
				<li>Meal preparation and light housekeeping</li>
				<li>Medication reminders and management</li>
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
