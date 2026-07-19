import z from 'zod'

export const zItem = z.object({
  name: z.string(),
  value: z.string()
})

export type Tab = z.infer<typeof zItem>
