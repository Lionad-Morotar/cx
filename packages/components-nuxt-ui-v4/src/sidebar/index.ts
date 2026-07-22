import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-sidebar',
  name: '侧边栏',
  description:
    'Nuxt UI v4 可折叠侧边栏，桌面内联折叠、移动端转为弹层菜单；物料层 open 单向映射 v-model:open',
  icon: 'i-tabler-layout-sidebar',
  component,
  props: {
    open: {
      name: '展开',
      type: 'switch',
      initial: true,
    },
    collapsible: {
      name: '折叠方式',
      type: 'card-selector',
      isPreview: true,
      initial: 'icon',
      options: [
        { label: '图标折叠', value: 'icon' },
        { label: '离屏折叠', value: 'offcanvas' },
        { label: '不可折叠', value: 'none' },
      ],
    },
    rail: {
      name: '轨道条',
      type: 'switch',
      initial: true,
    },
    side: {
      name: '停靠侧',
      type: 'card-selector',
      isPreview: true,
      initial: 'left',
      options: [
        { label: '左侧', value: 'left' },
        { label: '右侧', value: 'right' },
      ],
    },
  },
  slots: {
    header: { key: 'header', name: '头部' },
    default: { key: 'default', name: '内容' },
    footer: { key: 'footer', name: '底部' },
  },
})
