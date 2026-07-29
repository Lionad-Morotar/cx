import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '时间线',
  description:
    'Element Plus 时间线，按时间顺序展示事件；items 为事件数组（content/timestamp/type/color）。',
  key: 'cx-element-plus-timeline',
  icon: 'i-tabler-timeline',
  component,
  props: {
    items: {
      name: '事件',
      type: 'json',
      initial: () => [
        { content: '创建任务', timestamp: '2026-07-30', type: 'primary' },
        { content: '完成任务', timestamp: '2026-07-31', type: 'success' },
      ],
    },
  },
})
