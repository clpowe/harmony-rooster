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
})


function submitHandler(formData: typeof form.value) {
	console.log(form.value)
}

</script>

<template>
	<div>
		<FormKit type="form" @submit="submitHandler" />
	</div>
</template>
