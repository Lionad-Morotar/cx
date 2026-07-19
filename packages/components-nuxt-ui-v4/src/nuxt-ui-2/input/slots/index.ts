import z from 'zod'

export const binds = {
  disabled: {
    name: '禁用',
    description: '输入框是否标记为禁用',
    schema: z.boolean()
  },
  loading: {
    name: '加载中',
    description: '输入框是否标记为加载中',
    schema: z.boolean()
  }
}
