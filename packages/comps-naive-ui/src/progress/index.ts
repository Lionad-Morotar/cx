import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '进度',
  description: 'Naive UI 进度条；percentage/type/status/showIndicator 对应同名 prop。',
  key: 'cx-naive-ui-progress',
  icon: 'i-tabler-progress',
  component,
  props: {
    percentage: {
      name: '百分比',
      type: 'number',
      initial: 42,
    },
    type: {
      name: '形态',
      type: 'select',
      initial: 'line',
      options: [
        { label: '线形', value: 'line' },
        { label: '环形', value: 'circle' },
      ],
    },
    status: {
      name: '状态',
      type: 'select',
      initial: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '成功', value: 'success' },
        { label: '错误', value: 'error' },
        { label: '警告', value: 'warning' },
        { label: '信息', value: 'info' },
      ],
    },
    showIndicator: {
      name: '显示数值',
      type: 'boolean',
      initial: true,
    },
  },
})
