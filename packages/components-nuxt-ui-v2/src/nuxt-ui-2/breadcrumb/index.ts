import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelLinks from './panel/links.vue'
import { slotBinds } from './slots'

export default normalize({
  key: 'cx-breadcrumb',
  name: '面包屑导航',
  description: '面包屑导航用于展示一系列项目，可以表示层级关系，如页面路径、目录等',
  icon: 'i-tdesign-component-breadcrumb',
  component,
  props: {
    links: {
      type: 'custom',
      name: '内容',
      component: PanelLinks,
      initial: () => [
        {
          label: 'Home',
          icon: 'i-heroicons-home',
        },
        {
          label: 'Navigation',
          icon: 'i-heroicons-square-3-stack-3d',
        },
        {
          label: 'Breadcrumb',
          icon: 'i-heroicons-link',
        },
      ],
    },
    divider: {
      type: 'short',
      name: '分隔符',
      hidden: ({ cmpt }: any) => cmpt.data?.links?.length > 0,
    },
  },
  slots: () => {
    return [
      {
        key: 'default',
        name: '默认',
        binds: slotBinds,
      },
      {
        key: 'icon',
        name: '图标',
        binds: slotBinds,
      },
      {
        key: 'divider',
        name: '分隔符',
      },
    ].filter(Boolean)
  },
})
