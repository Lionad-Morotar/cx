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
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    navigate: {
      name: '跳转触发',
      description: '点击卡片,载荷为 (href, 标题),宿主据此回写对话',
    },
  },
})
