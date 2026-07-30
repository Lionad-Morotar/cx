import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '统计数值',
  description: 'Naive UI 统计数值；label/value/tabularNums 对应同名 prop。',
  key: 'cx-naive-ui-statistic',
  icon: 'i-tabler-chart-bar',
  component,
  props: {
    label: {
      name: '标签',
      type: 'short',
      initial: '累计访问量',
    },
    value: {
      name: '数值',
      type: 'short',
      initial: '12,345',
    },
    tabularNums: {
      name: '等宽数字',
      type: 'boolean',
      initial: true,
    },
  },
})
