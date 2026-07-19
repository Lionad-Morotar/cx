import z from 'zod'
import { zItem } from '../types'

export const slotBinds = {
  link: {
    name: '内容项',
    description: '当前插槽对应的面包屑内容项',
    schema: zItem
  },
  index: {
    name: '索引',
    description: '当前插槽对应的面包屑内容项的顺序（0、1、2...）',
    schema: z.number()
  },
  isActive: {
    name: '是否激活',
    description: '当项目设置和页面路径绑定时，对应面包屑项是否激活',
    schema: z.boolean()
  }
}
