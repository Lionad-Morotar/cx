import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '按钮',
  description: 'Element Plus 按钮，触发操作或事件；label 为按钮文本，其余配置对应 EP 同名 prop。',
  key: 'cx-element-plus-button',
  icon: 'i-tabler-hand-click',
  component,
  props: {
    label: {
      name: '按钮文本',
      type: 'short',
      initial: '按钮',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'default',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
        { label: '默认', value: 'default' },
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
    plain: {
      name: '朴素',
      type: 'boolean',
      initial: false,
    },
    round: {
      name: '圆角',
      type: 'boolean',
      initial: false,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
    loading: {
      name: '加载中',
      type: 'boolean',
      initial: false,
    },
  },
})
