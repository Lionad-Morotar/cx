import { define } from '@lionad/cx-definition'

import component from './src/index.vue'
import { CURVE_SELECT_OPTIONS } from '../shared/curve-options'

/** 验收页 initial 样本：月度访问趋势；x/y 字段名与 data 行键严格自洽 */
const initialData = () => [
  { month: '1月', visits: 3200 },
  { month: '2月', visits: 4100 },
  { month: '3月', visits: 3800 },
  { month: '4月', visits: 5200 },
  { month: '5月', visits: 4900 },
  { month: '6月', visits: 6300 },
  { month: '7月', visits: 7100 },
  { month: '8月', visits: 6800 },
]

export default define({
  name: '折线图',
  description:
    'TanStack Charts 折线图预设：data 行数组 + x/y 字段名 + curve 枚举，单 mark（lineY）规格经翻译层组装渲染。',
  key: 'cx-tanstack-charts-line',
  icon: 'i-tabler-chart-line',
  component,
  props: {
    // 声明序即回放剧本序列化序：x/y/curve 前置使增量帧首行起即携带通道配置，
    // data 殿后逐项生长（尾随标量不入增量帧，终帧兜底）
    x: {
      name: 'X 字段',
      type: 'short',
      initial: 'month',
    },
    y: {
      name: 'Y 字段',
      type: 'short',
      initial: 'visits',
    },
    curve: {
      name: '曲线插值',
      type: 'select',
      initial: 'monotoneX',
      options: CURVE_SELECT_OPTIONS,
    },
    data: {
      name: '数据',
      type: 'json',
      initial: initialData,
    },
    height: {
      name: '高度',
      type: 'number',
      initial: 320,
    },
    ariaLabel: {
      name: '无障碍标签',
      type: 'short',
      initial: '折线图',
    },
  },
})
