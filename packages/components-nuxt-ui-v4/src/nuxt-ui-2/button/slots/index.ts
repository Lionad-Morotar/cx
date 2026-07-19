import z from 'zod'

export const slotBinds = {
  disabled: {
    name: '禁用',
    description: '按钮是否禁用',
    schema: z.boolean()
  },
  loading: {
    name: '加载中',
    description: '按钮是否处于加载中状态',
    schema: z.boolean()
  }
}
