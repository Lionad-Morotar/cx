import z from 'zod'

export const zItem = z.object({
  id: z.string(),
  label: z.string(),
})

export type Item = z.infer<typeof zItem>
