import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-breadcrumb',
  name: '面包屑',
  description: 'Nuxt UI v4 面包屑导航，展示层级路径',
  icon: 'i-tdesign-component-breadcrumb',
  component,
  props: {
    items: {
      name: '面包屑项',
      type: 'custom',
      initial: () => [
        { label: '首页', icon: 'i-heroicons-home', to: '/' },
        { label: '文档', icon: 'i-heroicons-document' },
        { label: '当前页', icon: 'i-heroicons-link' },
      ],
    },
  },
  slots: {
    item: { key: 'item', name: '面包屑项' },
    'item-leading': { key: 'item-leading', name: '项前' },
    'item-trailing': { key: 'item-trailing', name: '项后' },
    separator: { key: 'separator', name: '分隔符' },
  },
})
