import z from 'zod'
import { zItem, zGroupItem } from '../types'

export const slotBinds = {
  group: {
    name: '分组',
    description: '当前插槽对应的分组',
    schema: zGroupItem
  },
  command: {
    name: '选项',
    description: '当前插槽对应的选项',
    schema: zItem
  },
  active: {
    name: '激活',
    description: '当前插槽对应的选项是否激活',
    schema: z.boolean()
  },
  selected: {
    name: '选中',
    description: '当前插槽对应的选项是否选中',
    schema: z.boolean()
  }
}
