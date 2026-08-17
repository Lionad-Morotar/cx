import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

/** 验收页 initial 样本：月度折线（lineY + point/linear 轴 + 网格），最小但有效的真实内容 */
const initialDefinition = () => ({
  marks: [
    {
      type: 'lineY',
      data: [
        { month: 'Jan', value: 40 },
        { month: 'Feb', value: 62 },
        { month: 'Mar', value: 55 },
        { month: 'Apr', value: 78 },
        { month: 'May', value: 70 },
        { month: 'Jun', value: 92 },
      ],
      x: 'month',
      y: 'value',
      stroke: '#2563eb',
      strokeWidth: 2.5,
      curve: 'monotoneX',
      points: true,
    },
    {
      type: 'ruleY',
      data: [70],
      stroke: '#e06e49',
      strokeWidth: 2,
      strokeDasharray: '6 6',
    },
  ],
  x: { scale: { kind: 'point' } },
  y: { scale: { kind: 'linear' }, grid: true, nice: true },
})

export default define({
  name: '图表',
  description:
    'TanStack Charts 通用图表：definition 为纯 JSON 声明式投影（marks/x/y/theme/tooltip 标量子集），经翻译层组装渲染；scale/curve 以枚举声明，channel 为字段名。',
  key: 'cx-tanstack-charts-chart',
  icon: 'i-tabler-chart-line',
  component,
  props: {
    definition: {
      name: '图表定义',
      type: 'json',
      initial: initialDefinition,
    },
    height: {
      name: '高度',
      type: 'number',
      initial: 320,
    },
    ariaLabel: {
      name: '无障碍标签',
      type: 'short',
      initial: '月度趋势图',
    },
  },
})
