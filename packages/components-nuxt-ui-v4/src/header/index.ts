import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-header',
  name: '页头',
  description:
    'Nuxt UI v4 响应式页头，标题链接 + 左中右三区，移动端菜单支持 modal / slideover / drawer 三种模式',
  icon: 'i-tabler-layout-navbar',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: 'Nuxt UI',
    },
    to: {
      name: '标题链接',
      type: 'short',
      initial: '/',
    },
    mode: {
      name: '菜单模式',
      type: 'card-selector',
      isPreview: true,
      initial: 'modal',
      options: [
        { label: '弹窗', value: 'modal' },
        { label: '侧滑', value: 'slideover' },
        { label: '抽屉', value: 'drawer' },
      ],
    },
  },
  slots: {
    title: { key: 'title', name: '标题区' },
    left: { key: 'left', name: '左区' },
    default: { key: 'default', name: '中区' },
    right: { key: 'right', name: '右区' },
    body: { key: 'body', name: '菜单体' },
    content: { key: 'content', name: '菜单内容' },
  },
})
