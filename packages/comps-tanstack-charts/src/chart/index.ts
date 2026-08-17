import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

/** 验收页 initial 样本：月度折线（lineY + point/linear 轴 + 网格），示范数据顶层化契约——
 *  rows 顶层数据集 + marks 字符串引用，流式回放可逐行生长 */
const initialDefinition = () => ({
  marks: [
    {
      type: 'lineY',
      data: 'rows',
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

const initialRows = () => [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 62 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 78 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 92 },
]

export default define({
  name: '图表',
  description:
    'TanStack Charts 通用图表（cx-chart）：definition 为纯 JSON 声明式投影（marks/x/y/theme/tooltip 标量子集），数据顶层化——rows/nodes/links 命名数据集与 definition 平级、marks 内字符串引用，经翻译层组装渲染；scale/curve 以枚举声明，channel 为字段名。',
  key: 'cx-chart',
  icon: 'i-tabler-chart-line',
  component,
  props: {
    definition: {
      name: '图表定义',
      type: 'json',
      initial: initialDefinition,
    },
    rows: {
      name: '数据集',
      type: 'json',
      initial: initialRows,
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
