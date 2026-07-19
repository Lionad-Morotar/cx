import z from 'zod'

export const binds = {
  value: {
    name: '值',
    description: '当前值',
    schema: z.number(),
  },
  percent: {
    name: '百分比',
    description: '当前值占最大值的百分比（0-100）',
    schema: z.number(),
  },
}
