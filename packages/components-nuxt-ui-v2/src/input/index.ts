import z from 'zod'
import { define } from '@lionad/cx-definition'
import component from './src/index.vue'
import { compColorNames3, useSizeOptions } from '@lionad/cx-vue'
import { binds } from './slots'

export default define({
  key: 'cx-input',
  name: '输入框',
  description: '输入框组件',
  icon: 'i-ri-input-field',
  component,
  props: {
    dftValue: {
      type: 'short',
      name: '默认值',
      initial: '',
    },
    type: {
      type: 'select',
      name: '输入类型',
      options: [
        { label: '文本', value: 'text' },
        { label: '数字', value: 'number' },
        { label: '密码', value: 'password' },
        // TODO file type input
      ],
    },
    placeholder: {
      type: 'short',
      name: '占位符',
      initial: '输入内容',
    },
    icon: {
      type: 'icon',
      name: '图标',
    },
    disabled: {
      type: 'boolean',
      name: '禁用',
      initial: false,
    },
    loading: {
      type: 'boolean',
      name: '加载中',
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
    },
    size: {
      type: 'card-selector',
      name: '大小',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl'),
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: compColorNames3,
    },
  },
  emits: {
    change: {
      name: '变化',
      description: '输入的值发生变化，通常在失焦时变化',
      schema: z.union([z.string(), z.number()]),
    },
    blur: {
      name: '失焦',
      description: '输入框失去焦点',
    },
  },
  slots: () => {
    const res = []
    res.push(
      {
        key: 'leading',
        name: '输入前区域',
        binds,
      },
      {
        key: 'trailing',
        name: '输入后区域',
        binds,
      },
    )
    return res.filter(Boolean)
  },
})
