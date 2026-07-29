import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '进度条',
  description: 'Element Plus 进度条，展示操作进度；percentage/type/status 对应 EP 同名 prop。',
  key: 'cx-element-plus-progress',
  icon: 'i-tabler-progress',
  component,
  props: {
    percentage: {
      name: '百分比',
      type: 'number',
      initial: 0,
    },
    type: {
      name: '形态',
      type: 'select',
      initial: 'line',
      options: [
        { label: '线形', value: 'line' },
        { label: '圆形', value: 'circle' },
        { label: '仪表盘', value: 'dashboard' },
      ],
    },
    status: {
      name: '状态',
      type: 'select',
      initial: '',
      options: [
        { label: '默认', value: '' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '异常', value: 'exception' },
      ],
    },
    strokeWidth: {
      name: '线宽',
      type: 'number',
      initial: 6,
    },
    textInside: {
      name: '进度条内显示文字',
      type: 'boolean',
      initial: false,
    },
  },
})
