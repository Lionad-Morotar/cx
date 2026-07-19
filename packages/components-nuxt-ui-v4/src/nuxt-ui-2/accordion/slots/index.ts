import z from 'zod'
import { zItem } from '../types'

export const slotBinds = {
  item: {
    name: '项目',
    description: '当前插槽对应的手风琴项',
    schema: zItem
  },
  index: {
    name: '索引',
    description: '当前插槽对应的手风琴项的顺序（0、1、2...）',
    schema: z.number()
  },
  open: {
    name: '展开',
    description: '展开某项',
    schema: z.instanceof(Function)
  },
  close: {
    name: '折叠',
    description: '折叠某项',
    schema: z.instanceof(Function)
  }
}
