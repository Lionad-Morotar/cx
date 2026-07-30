import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '时间线',
  description: 'Naive UI 时间线；items 为事件数组（title/content/time/type）。',
  key: 'cx-naive-ui-timeline',
  icon: 'i-tabler-timeline',
  component,
  props: {
    items: {
      name: '事件',
      type: 'json',
      initial: () => [
        { title: '创建任务', content: '任务已创建', time: '2026-07-30', type: 'success' },
        { title: '处理中', content: '正在处理', time: '2026-07-31', type: 'info' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
  },
})
