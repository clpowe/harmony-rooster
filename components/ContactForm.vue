<script setup lang="ts">
import { createZodPlugin } from '@formkit/zod'
import { contactValidator } from '@/validators'

const form = shallowRef({
	name: '',
	email: '',
	message: ''
})

createZodPlugin(contactValidator,
	async (formData) => {
		await new Promise((r) => setTimeout(r, 2000))
		alert('Thank you for your message!')
		console.log(formData)
	})


function submitHandler(formData: typeof form.value) {
	console.log(form.value)
}

</script>

<template>
	<div>
		<FormKit type="form" @submit="submitHandler">
			<FormKit type="text" name="name" label="Name" placeholder="Your Name" v-model="form.name" :delay="1000" />
			<FormKit type="email" name="email" label="Email" placeholder="Your Email" v-model="form.email" />
			<FormKit type="textarea" name="message" label="Message" placeholder="Your Message" v-model="form.message" />
			<Formkit type="submit" label="Submit" />
		</FormKit>
	</div>
</template>
