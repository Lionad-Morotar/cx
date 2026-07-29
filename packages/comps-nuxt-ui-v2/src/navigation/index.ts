import { define, CxEvents } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelTabs from './panel/items.vue'
import { createItem } from './utils'
import { binds } from './slots'

export default define({
  key: 'cx-navigation',
  name: '水平导航',
  description: '水平导航',
  icon: 'i-tabler-menu-4',
  component,
  props: {
    items: {
      type: 'custom',
      name: '导航项',
      component: PanelTabs,
      initial: () => [createItem('项目1')],
    },
    divideFrom: {
      type: 'select',
      name: '分隔',
      initial: '',
      help: '从选中的分隔项开始，将导航项分隔为两个部分。',
      multiple: false,
      hidden: ({ comp }: any) => {
        return (comp.data?.items || []).length < 2 || comp.data?.orientation !== 'horizontal'
      },
      options: ({ comp }: any) => {
        return (comp.data?.items || []).slice(1)
      },
    },
    divideFromMultiple: {
      type: 'select',
      name: '分隔',
      initial: () => [],
      help: '从选中的分隔项开始，将导航项分隔为多个部分。',
      multiple: true,
      hidden: ({ comp }: any) => {
        return (comp.data?.items || []).length < 2 || comp.data?.orientation !== 'vertical'
      },
      options: ({ comp }: any) => {
        return (comp.data?.items || []).slice(1)
      },
    },
    orientation: {
      type: 'select',
      name: '方向',
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
  },
  exposes: {
    ...CxEvents.displaySubComp.define,
  },
  slots: {
    icon: {
      key: 'icon',
      name: '导航页头部',
      binds,
    },
    default: {
      key: 'default',
      name: '导航项',
      binds,
    },
    badge: {
      key: 'badge',
      name: '导航页尾部',
      binds,
    },
  },
})
