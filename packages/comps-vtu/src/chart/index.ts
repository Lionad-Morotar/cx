import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '图表',
  description: 'chart.js 图表（柱状/折线），数据行须含 xKey 与各 series key 且为有限数。',
  key: 'cx-vtu-chart',
  icon: 'i-tabler-chart-bar',
  component,
  props: {
    type: {
      name: '图表类型',
      type: 'card-selector',
      isPreview: true,
      initial: 'bar',
      options: [
        { label: '柱状', value: 'bar' },
        { label: '折线', value: 'line' },
      ],
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '月度活跃用户',
    },
    xKey: {
      name: 'X 轴字段',
      type: 'short',
      initial: 'month',
    },
    series: {
      name: '数据系列',
      type: 'json',
      initial: () => [{ key: 'users', label: '用户数' }],
    },
    data: {
      name: '数据',
      type: 'json',
      initial: () => [
        { month: '一月', users: 120 },
        { month: '二月', users: 180 },
        { month: '三月', users: 150 },
      ],
    },
    showLegend: {
      name: '显示图例',
      type: 'switch',
      initial: true,
    },
    showGrid: {
      name: '显示网格',
      type: 'switch',
      initial: true,
    },
  },
})
