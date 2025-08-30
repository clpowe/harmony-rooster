<template>
	<div>
		<header>
			<SvgoIconRoosterbg class="icon" filled :fontControlled="true" />

			<div class="actions">
				<button class="btn-lg btn-primary">Lets Chat</button>
				<button class="btn-lg btn-accent">813-888-8888</button>
			</div>
		</header>
		<slot />
		<footer> Copyright © {{ new Date().getFullYear() }} </footer>
	</div>
</template>
