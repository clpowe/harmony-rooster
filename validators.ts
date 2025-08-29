import { z } from "zod"

export const contactValidator = z.object({
	name: z.string().min(6, "You must provide a name"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	message: z.string().min(10)
})
