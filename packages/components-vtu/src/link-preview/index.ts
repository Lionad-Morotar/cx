import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '链接预览',
  description: '链接预览卡，含链接、标题、描述、缩略图与域名，支持跳转事件。',
  key: 'cx-vtu-link-preview',
  icon: 'i-tabler-link',
  component,
  props: {
    href: {
      name: '链接',
      type: 'short',
      initial: 'https://example.com/page',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '页面标题',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '一段页面摘要描述。',
    },
    image: {
      name: '缩略图',
      type: 'short',
      initial: 'https://picsum.photos/seed/lp/480/270',
    },
    domain: {
      name: '域名',
      type: 'short',
      initial: 'example.com',
    },
  },
})
