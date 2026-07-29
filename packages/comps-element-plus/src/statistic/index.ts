import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '统计数值',
  description:
    'Element Plus 统计数值，突出展示数字指标；title/value/prefix/suffix 对应 EP 同名 prop。',
  key: 'cx-element-plus-statistic',
  icon: 'i-tabler-chart-bar',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '指标',
    },
    value: {
      name: '数值',
      type: 'number',
      initial: 0,
    },
    precision: {
      name: '小数精度',
      type: 'number',
      initial: 0,
    },
    prefix: {
      name: '前缀',
      type: 'short',
      initial: '',
    },
    suffix: {
      name: '后缀',
      type: 'short',
      initial: '',
    },
  },
})
