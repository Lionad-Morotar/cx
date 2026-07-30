import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '按钮',
  description: 'Naive UI 按钮，触发操作或事件；label 为按钮文本，其余配置对应 naive-ui 同名 prop。',
  key: 'cx-naive-ui-button',
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
        { label: '默认', value: 'default' },
        { label: '主要', value: 'primary' },
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
    dashed: {
      name: '虚线',
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
