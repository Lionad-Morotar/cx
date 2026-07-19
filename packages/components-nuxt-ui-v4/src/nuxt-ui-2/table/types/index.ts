import z from 'zod'

export const zData = z
  .object({
    id: z.string(),
    label: z.string(),
    disabledExpand: z.boolean().optional(),
  })
  .passthrough()

const genZColumn = <T extends z.ZodType<any, any, any>>(item: T) =>
  z.object({
    label: z.string(),
    key: z.string(),
    sortable: z.boolean().optional(),
    direction: z.enum(['asc', 'desc']).optional(),
    sort: z.instanceof(Function).optional(),
  })

export const zColumn = genZColumn(zData)

export type Data = z.infer<typeof zData>

export type Column = z.infer<typeof zColumn>
