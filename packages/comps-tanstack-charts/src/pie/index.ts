import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

/** 验收页 initial 样本：流量来源占比；name/value 字段名与 data 行键严格自洽 */
const initialData = () => [
  { name: '搜索', value: 62 },
  { name: '社交', value: 18 },
  { name: '电商', value: 12 },
  { name: '视频', value: 8 },
]

export default define({
  name: '饼图',
  description:
    'TanStack Charts 饼图预设：data 行数组 + name/value 字段名，pie 变换 + polar(radialArc) 物料级组装；innerRadiusRatio > 0 呈环形。',
  key: 'cx-tanstack-charts-pie',
  icon: 'i-tabler-chart-pie',
  component,
  props: {
    // 声明序即回放剧本序列化序：name/value/innerRadiusRatio 前置使增量帧首扇区起即携带
    // 通道配置，data 殿后逐扇区生长
    name: {
      name: '类目字段',
      type: 'short',
      initial: 'name',
    },
    value: {
      name: '数值字段',
      type: 'short',
      initial: 'value',
    },
    innerRadiusRatio: {
      name: '空心比',
      type: 'number',
      initial: 0,
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
      initial: '占比饼图',
    },
  },
})
