import z from 'zod'

export const zItem = z.object({
  label: z.string(),
  value: z.string(),
})

export type Item = z.infer<typeof zItem>
