import z from 'zod'
import { normalize, CxEvents } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelTabs from './panel/tabs.vue'
import { createTab } from './utils'
import { bindTab } from './slots'
import type { Tab } from './types'
import { omit as useOmit } from 'lodash-es'

export default normalize({
  key: 'cx-tabs',
  name: '标签页',
  description: '选中不同的标签，可以切换到不同的显示内容。',
  icon: 'i-ph-tabs',
  component,
  props: {
    tabs: {
      name: '标签页',
      type: 'custom',
      component: PanelTabs,
      initial: () => [createTab('标签页1')],
    },
    // not work
    // orientation: {
    //   type: 'select',
    //   name: '方向',
    //   initial: 'horizontal',
    //   options: [
    //     { label: '水平', value: 'horizontal' },
    //     { label: '垂直', value: 'vertical' },
    //   ]
    // },
  },
  emits: {
    change: {
      name: '切换',
      description: '切换标签页',
      schema: z.number(),
    },
  },
  exposes: {
    change: {
      name: '切换',
      description: '切换标签页',
      schema: z.number(),
    },
    ...CxEvents.displaySubComp.define,
  },
  slots: ({ comp }: any) => {
    const res: any[] = [
      {
        key: 'default',
        name: '标签',
        binds: bindTab,
      },
      {
        key: 'icon',
        name: '标签前图标',
        binds: bindTab,
      },
    ]
    const tabs = (comp?.data?.tabs || []) as Tab[]
    if (!tabs.length) {
      return res
    }
    const tabSlots = tabs.map((tab) => ({
      name: tab.name,
      key: tab.value,
      icon: 'i-mdi-tab',
      binds: useOmit(bindTab, ['disabled']),
    }))
    res.push(
      {
        name: '所有标签页前',
        key: 'default-start',
        icon: 'i-mdi-table-row-plus-before',
      },
      {
        name: '所有标签页后',
        key: 'default-end',
        icon: 'i-mdi-table-row-plus-after',
      },
      ...tabSlots,
    )
    return res
  },
})
