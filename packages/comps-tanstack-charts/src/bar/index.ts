import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

/** 验收页 initial 样本：类目销量对比；x/y 字段名与 data 行键严格自洽 */
const initialData = () => [
  { product: '手机', sales: 860 },
  { product: '平板', sales: 520 },
  { product: '笔记本', sales: 640 },
  { product: '耳机', sales: 430 },
  { product: '手表', sales: 280 },
]

export default define({
  name: '柱状图',
  description:
    'TanStack Charts 柱状图预设：data 行数组 + x/y 字段名，单 mark（barY + band 轴）规格经翻译层组装渲染。',
  key: 'cx-tanstack-charts-bar',
  icon: 'i-tabler-chart-bar',
  component,
  props: {
    // 声明序即回放剧本序列化序：x/y 前置使增量帧首行起即携带通道配置，data 殿后逐项生长
    x: {
      name: 'X 字段',
      type: 'short',
      initial: 'product',
    },
    y: {
      name: 'Y 字段',
      type: 'short',
      initial: 'sales',
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
      initial: '柱状图',
    },
  },
})
