import z from 'zod'
import { zItem } from '../types'

export const slotItemBinds = {
  item: {
    name: '内容项',
    description: '当前插槽对应的内容项',
    schema: zItem,
  },
  index: {
    name: '索引',
    description: '当前插槽对应的内容项的顺序（0、1、2...）',
    schema: z.number(),
  },
}

export const slotPrevBinds = {
  onClickPrev: {
    name: '切换上一项',
    description: '切换到上一项内容，如果已经是第一项则不会切换',
    schema: z.instanceof(Function),
  },
  disabled: {
    name: '不可用',
    description: '是否不可用',
    schema: z.boolean(),
  },
}

export const slotNextBinds = {
  onClickNext: {
    name: '切换下一项',
    description: '切换到下一项内容，如果已经是最后一项则不会切换',
    schema: z.instanceof(Function),
  },
  disabled: slotPrevBinds.disabled,
}

export const slotIndicatorBinds = {
  page: {
    name: '页码',
    description: '当前页码',
    schema: z.number(),
  },
  active: {
    name: '激活',
    description: '是否激活',
    schema: z.boolean(),
  },
  onClick: {
    name: '点击',
    description: '点击指示器',
    schema: z.instanceof(Function),
  },
}
