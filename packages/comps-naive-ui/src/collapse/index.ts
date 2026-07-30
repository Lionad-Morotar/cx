import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '折叠面板',
  description: 'Naive UI 折叠面板；items 为面板数组（title/content），accordion 为手风琴模式。',
  key: 'cx-naive-ui-collapse',
  icon: 'i-tabler-fold',
  component,
  props: {
    items: {
      name: '面板',
      type: 'json',
      initial: () => [
        { title: '第一章', content: '第一章的正文内容' },
        { title: '第二章', content: '第二章的正文内容' },
      ],
    },
    accordion: {
      name: '手风琴',
      type: 'boolean',
      initial: false,
    },
  },
})
