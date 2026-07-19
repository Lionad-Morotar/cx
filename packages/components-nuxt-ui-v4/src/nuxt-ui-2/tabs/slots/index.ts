import z from 'zod'
import { zItem } from '../types'

export const bindTab = {
  item: {
    name: '标签',
    description: '当前插槽对应的标签项',
    schema: zItem
  },
  index: {
    name: '索引',
    description: '当前插槽对应的标签项的顺序（0、1、2...）',
    schema: z.number()
  },
  selected: {
    name: '选中',
    description: '标签是否被选中',
    schema: z.boolean()
  },
  disabled: {
    name: '禁用',
    description: '标签是否被禁用',
    schema: z.boolean()
  }
}
