import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '统计展示',
  description: '统计指标卡片组，带数值格式化、差异与迷你折线（sparkline 数据至少 2 点）。',
  key: 'cx-vtu-stats-display',
  icon: 'i-tabler-report-analytics',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '核心指标',
    },
    stats: {
      name: '统计项',
      type: 'json',
      initial: () => [
        {
          key: 'revenue',
          label: '营收',
          value: 12800,
          format: { kind: 'currency', currency: 'CNY' },
          diff: { value: 12.5 },
        },
        {
          key: 'users',
          label: '用户',
          value: 3420,
          format: { kind: 'number' },
          sparkline: { data: [10, 14, 12, 18, 22] },
        },
      ],
    },
  },
})
