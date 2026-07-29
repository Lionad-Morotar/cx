import z from 'zod'
import { zItem } from '../types'

export const binds = {
  link: {
    name: '项目',
    description: '当前插槽对应导航项',
    schema: zItem,
  },
  isActive: {
    name: '激活',
    description: '当前导航项是否激活',
    schema: z.boolean(),
  },
}
