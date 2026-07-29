import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-drawer',
  name: '抽屉',
  description: 'Nuxt UI v4 抽屉，屏幕边缘平滑滑入的内容面板',
  icon: 'i-tabler-layout-sidebar-right',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '抽屉标题',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '',
    },
    direction: {
      name: '滑入方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'bottom',
      options: [
        { label: '底部', value: 'bottom' },
        { label: '右侧', value: 'right' },
        { label: '左侧', value: 'left' },
        { label: '顶部', value: 'top' },
      ],
    },
    close: {
      name: '关闭按钮',
      type: 'switch',
    },
    inset: {
      name: '边缘内缩',
      type: 'switch',
    },
    handle: {
      name: '拖拽把手',
      type: 'switch',
      initial: true,
    },
  },
  slots: {
    default: { key: 'default', name: '触发器' },
    content: { key: 'content', name: '抽屉内容' },
    header: { key: 'header', name: '头部' },
    body: { key: 'body', name: '主体' },
    footer: { key: 'footer', name: '底部' },
  },
})
