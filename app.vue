<template>
	<div>
		<header>
			<div
				class="max-w-6xl mx-auto p-4 md:p-8 flex justify-between items-center"
			>
				<div class="flex gap-4 items-center">
					<SvgoIconRoosterbg
						class="w-12 h-12 fill-primary"
						filled
						:fontControlled="false"
					/>
				</div>

				<div class="flex gap-4">
					<Button size="sm">Lets Chat</Button>
					<Button size="sm" variant="outline">813-888-8888</Button>
				</div>
			</div>
		</header>
		<NuxtPage />
		<footer>
			<p>Harmony Rooster LLC 2022</p>
		</footer>
	</div>
</template>
