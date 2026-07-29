import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-navigation-menu',
  name: '导航菜单',
  description: 'Nuxt UI v4 导航菜单，支持多级菜单与子项展开',
  icon: 'i-material-symbols-menu-book-outline-sharp',
  component,
  props: {
    orientation: {
      name: '方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '中性', value: 'neutral' },
      ],
    },
    items: {
      name: '菜单项',
      type: 'custom',
      initial: () => [
        { label: '首页', icon: 'i-heroicons-home', to: '/' },
        {
          label: '产品',
          icon: 'i-heroicons-cube',
          children: [
            { label: '功能', to: '/features' },
            { label: '定价', to: '/pricing' },
          ],
        },
        { label: '关于', icon: 'i-heroicons-information-circle', to: '/about' },
      ],
    },
  },
  slots: {
    item: { key: 'item', name: '菜单项' },
    'item-leading': { key: 'item-leading', name: '项前' },
    'item-trailing': { key: 'item-trailing', name: '项后' },
  },
})
