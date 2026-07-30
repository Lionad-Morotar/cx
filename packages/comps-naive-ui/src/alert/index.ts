import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '警告',
  description: 'Naive UI 警告提示；title 为标题（prop），content 经 default slot 注入正文。',
  key: 'cx-naive-ui-alert',
  icon: 'i-tabler-alert-triangle',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '提示',
    },
    content: {
      name: '正文',
      type: 'short',
      initial: '这是一条提示信息',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
      ],
    },
    closable: {
      name: '可关闭',
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
