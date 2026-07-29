import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '警告',
  description:
    'Element Plus 警告提示，展现需要关注的信息；title/description/type 对应 EP 同名 prop。',
  key: 'cx-element-plus-alert',
  icon: 'i-tabler-alert-triangle',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '提示信息',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'info',
      options: [
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '信息', value: 'info' },
        { label: '错误', value: 'error' },
      ],
    },
    description: {
      name: '辅助描述',
      type: 'short',
      initial: '',
    },
    effect: {
      name: '主题',
      type: 'select',
      initial: 'light',
      options: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
      ],
    },
    closable: {
      name: '可关闭',
      type: 'boolean',
      initial: true,
    },
    center: {
      name: '居中',
      type: 'boolean',
      initial: false,
    },
    showIcon: {
      name: '显示图标',
      type: 'boolean',
      initial: true,
    },
  },
})
