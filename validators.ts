import { z } from "zod"

export const contactValidator = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	message: z.string().min(10)
})
