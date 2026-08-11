import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

/** 验收页 initial 样本：身高体重数值散点；x/y 字段名与 data 行键严格自洽 */
const initialData = () => [
  { height: 162, weight: 55 },
  { height: 165, weight: 58 },
  { height: 168, weight: 62 },
  { height: 170, weight: 60 },
  { height: 172, weight: 68 },
  { height: 175, weight: 72 },
  { height: 178, weight: 70 },
  { height: 180, weight: 78 },
  { height: 183, weight: 82 },
  { height: 185, weight: 80 },
]

export default define({
  name: '散点图',
  description:
    'TanStack Charts 散点图预设：data 行数组 + x/y 数值字段名，单 mark（dot + 双 linear 轴）规格经翻译层组装渲染。',
  key: 'cx-tanstack-charts-dot',
  icon: 'i-tabler-chart-dots',
  component,
  props: {
    data: {
      name: '数据',
      type: 'json',
      initial: initialData,
    },
    x: {
      name: 'X 字段',
      type: 'short',
      initial: 'height',
    },
    y: {
      name: 'Y 字段',
      type: 'short',
      initial: 'weight',
    },
    height: {
      name: '高度',
      type: 'number',
      initial: 320,
    },
    ariaLabel: {
      name: '无障碍标签',
      type: 'short',
      initial: '散点图',
    },
  },
})
