import z from 'zod'

export const zError = z.object({
  message: z.string(),
  path: z.string(),
})

export type Error = z.infer<typeof zError>
