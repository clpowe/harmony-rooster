<script setup lang="ts">
	import { useForm } from 'vee-validate'
	import { toTypedSchema } from '@vee-validate/zod'
	import * as z from 'zod'

	const formSchema = toTypedSchema(
		z.object({
			name: z.string().min(2).max(50),
			email: z.string().email(),
			message: z.string().min(2).max(500)
		})
	)

	const form = useForm({
		validationSchema: formSchema
	})

	const onSubmit = form.handleSubmit((values) => {
		console.log('Form submitted:', values)
	})
</script>

<template>
	<!-- <form @submit="onSubmit" class="flex flex-col gap-4">
		<FormField v-slot="{ componentField }" name="name">
			<FormItem class="flex flex-col">
				<FormLabel>Name</FormLabel>
				<FormControl>
					<Input
						type="text"
						placeholder="Enter your name"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<FormField v-slot="{ componentField }" name="email">
			<FormItem class="flex flex-col">
				<FormLabel>Email</FormLabel>
				<FormControl>
					<Input
						type="email"
						placeholder="Enter your email address"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<FormField v-slot="{ componentField }" name="message">
			<FormItem class="flex flex-col">
				<FormLabel>Message</FormLabel>
				<FormControl>
					<Textarea placeholder="Enter your message" v-bind="componentField" />
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<Button type="submit"> Submit </Button>
	</form> -->
</template>
