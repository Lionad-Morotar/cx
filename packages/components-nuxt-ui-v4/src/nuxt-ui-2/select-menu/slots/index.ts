import z from 'zod'
import { zItem } from '../types'

export const bindQuery = {
  query: {
    name: '搜索词',
    description: '当前输入框中输入的内容',
    schema: z.string()
  }
}

export const bindOption = {
  option: {
    name: '选项',
    description: '当前插槽对应的选项',
    schema: zItem
  },
  active: {
    name: '激活',
    description: '当前选项是否被激活',
    schema: z.boolean()
  },
  selected: {
    name: '选中',
    description: '当前选项是否被选中',
    schema: z.boolean()
  }
}
