import { define } from '@lionad/cx-definition'

import component from './src/index.vue'
import { CURVE_SELECT_OPTIONS } from '../shared/curve-options'

/** 验收页 initial 样本：周活跃趋势；x/y 字段名与 data 行键严格自洽 */
const initialData = () => [
  { week: 'W1', active: 1200 },
  { week: 'W2', active: 1800 },
  { week: 'W3', active: 1500 },
  { week: 'W4', active: 2400 },
  { week: 'W5', active: 2100 },
  { week: 'W6', active: 2900 },
  { week: 'W7', active: 3300 },
  { week: 'W8', active: 3100 },
]

export default define({
  name: '面积图',
  description:
    'TanStack Charts 面积图预设：data 行数组 + x/y 字段名 + curve 枚举，单 mark（areaY）规格经翻译层组装渲染。',
  key: 'cx-tanstack-charts-area',
  icon: 'i-tabler-chart-area',
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
      initial: 'week',
    },
    y: {
      name: 'Y 字段',
      type: 'short',
      initial: 'active',
    },
    curve: {
      name: '曲线插值',
      type: 'select',
      initial: 'monotoneX',
      options: CURVE_SELECT_OPTIONS,
    },
    height: {
      name: '高度',
      type: 'number',
      initial: 320,
    },
    ariaLabel: {
      name: '无障碍标签',
      type: 'short',
      initial: '面积图',
    },
  },
})
