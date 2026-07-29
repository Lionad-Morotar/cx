import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '标签',
  description:
    'Element Plus 标签，标记事物属性；label 为标签文本，type/effect/size 对应 EP 同名 prop。',
  key: 'cx-element-plus-tag',
  icon: 'i-tabler-tag',
  component,
  props: {
    label: {
      name: '标签文本',
      type: 'short',
      initial: '标签',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
      ],
    },
    effect: {
      name: '主题',
      type: 'select',
      initial: 'light',
      options: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '朴素', value: 'plain' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' },
      ],
    },
    round: {
      name: '圆角',
      type: 'boolean',
      initial: false,
    },
  },
})
