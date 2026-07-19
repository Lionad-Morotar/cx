import z from 'zod'
import { zItem } from '../types'

export const binds = {
  step: {
    name: '步骤',
    description: '插槽对应的步骤',
    schema: zItem
  },
  percent: {
    name: '百分比',
    description: '当前值占最大值的百分比（0-100）',
    schema: z.number()
  }
}
