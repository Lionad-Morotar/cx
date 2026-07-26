import z from 'zod'
import { normalize, has, not } from '@lionad/cx-definition'
import component from './src/index.vue'
import { slotItemBinds, slotPrevBinds, slotNextBinds, slotIndicatorBinds } from './slots'
import panelContent from './panel/content.vue'

export default normalize({
  key: 'cx-carousel',
  name: '轮播图',
  description: '在可滚动区域中显示图像或内容',
  icon: 'i-icon-park-outline-carousel',
  component,
  props: {
    items: {
      type: 'custom',
      name: '内容项',
      component: panelContent,
      initial: () => [
        { id: '1', content: '内容项1' },
        { id: '2', content: '内容项2' },
      ],
    },
    single: {
      type: 'switch',
      name: '单个显示',
      initial: true,
    },
    snap: {
      type: 'button-group',
      name: '吸附',
      initial: 'c',
      options: [
        { label: '左', value: 'l', icon: 'i-tabler-box-align-left' },
        { label: '中', value: 'c', icon: 'i-tabler-box-margin' },
        { label: '右', value: 'r', icon: 'i-tabler-box-align-right' },
      ],
      hidden: ({ comp }: any) => not(comp.data?.size) || has(comp.data?.single),
    },
    size: {
      type: 'button-group',
      name: '单个项目宽',
      options: [
        { value: '1', label: '100%' },
        { value: '1/2', label: '1/2' },
        { value: '1/3', label: '1/3' },
        { value: '1/4', label: '1/4' },
      ],
      hidden: ({ comp }: any) => has(comp.data?.single),
    },
    arrow: {
      type: 'switch',
      name: '切换按钮',
      initial: false,
    },
    indicators: {
      type: 'switch',
      name: '指示器',
      initial: false,
    },
    autoplay: {
      type: 'switch',
      name: '自动播放',
      initial: false,
    },
    autoplayTime: {
      type: 'range',
      name: '自动播放时间',
      initial: 3000,
      min: 1000,
      max: 10000,
      hidden: ({ comp }: any) => not(comp.data?.autoplay),
    },
  },
  emits: {
    prev: {
      name: '上一项',
      description: '切换到上一项',
    },
    next: {
      name: '下一项',
      description: '切换到下一项',
    },
    select: {
      name: '选中',
      description: '选中了某一项',
      schema: z.number(),
    },
  },
  exposes: {
    pages: {
      name: '总页数',
      schema: z.number(),
    },
    page: {
      name: '当前页',
      schema: z.number(),
    },
    prev: {
      name: '上一项',
      description: '切换到上一项',
    },
    next: {
      name: '下一项',
      description: '切换到下一项',
    },
    select: {
      name: '选中',
      description: '选中了某一项（1、2、3...）',
      schema: z.instanceof(Function),
    },
  },
  slots: () => {
    return [
      {
        key: 'default',
        name: '内容项',
        binds: slotItemBinds,
      },
      {
        key: 'indicator',
        name: '指示器',
        binds: slotIndicatorBinds,
      },
      {
        key: 'prev',
        name: '切换上一项',
        binds: slotPrevBinds,
      },
      {
        key: 'next',
        name: '切换下一项',
        binds: slotNextBinds,
      },
    ].filter(Boolean)
  },
})
