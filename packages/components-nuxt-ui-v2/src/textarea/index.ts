import z from 'zod'
import { normalize, has, not } from '@lionad/cx-definition'
import component from './src/index.vue'
import { compColorNames3, useSizeOptions } from '@lionad/cx-vue'

export default normalize({
  key: 'cx-textarea',
  name: '多行文本输入框',
  description: '多行文本输入框组件',
  icon: 'i-ant-design-edit-outlined',
  component,
  props: {
    placeholder: {
      type: 'short',
      name: '占位符',
      initial: '输入内容',
    },
    autoresize: {
      type: 'boolean',
      name: '自动高度',
      initial: true,
    },
    maxrows: {
      type: 'range',
      name: '最大行数',
      initial: 20,
      min: 1,
      max: 20,
      hidden: ({ comp }: any) => not(comp.data?.autoresize),
    },
    rows: {
      type: 'range',
      name: '行数',
      initial: 0,
      min: 0,
      max: 20,
      hidden: ({ comp }: any) => has(comp.data?.autoresize),
    },
    resize: {
      type: 'boolean',
      name: '允许手动调节高度',
      initial: false,
    },
    padded: {
      type: 'boolean',
      name: '内边距',
      initial: true,
    },
    variant: {
      type: 'card-selector',
      name: '样式',
      isPreview: true,
      options: [
        { label: '边框', value: 'outline' },
        { label: '无边框', value: 'none' },
      ],
      pickData: ({ data }: any) => ({ ...data, autoresize: false, rows: 1 }),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
    size: {
      type: 'card-selector',
      name: '大小',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl'),
      pickData: ({ data }: any) => ({ ...data, autoresize: false, rows: 1 }),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: compColorNames3,
      pickData: ({ data }: any) => ({ ...data, autoresize: false, rows: 1 }),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
  },
  emits: {
    change: {
      name: '变化',
      description: '输入的值发生变化，通常在失焦时变化',
      schema: z.string(),
    },
    blur: {
      name: '失焦',
      description: '输入框失去焦点',
    },
  },
})
