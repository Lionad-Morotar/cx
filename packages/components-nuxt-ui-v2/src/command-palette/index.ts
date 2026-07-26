import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import panelGroups from './panel/groups.vue'
import type { CxComponentSlot } from '@lionad/cx-definition'
import { slotBinds } from './slots'
import type { FuseResults } from './types'

export default normalize({
  key: 'cx-command-palette',
  name: '选项面板',
  description: '使用选项面板搜索和选择一系列选项',
  icon: 'i-tabler-command',
  component,
  props: {
    icon: {
      type: 'icon',
      name: '图标',
    },
    placeholder: {
      type: 'short',
      name: '占位符',
    },
    clear: {
      type: 'switch',
      name: '显示清除',
    },
    groups: {
      type: 'custom',
      name: '分组',
      component: panelGroups,
      initial: () => [],
    },
    dftQuery: {
      type: 'short',
      name: '默认搜索内容',
    },
  },
  emits: {
    close: {
      name: '关闭',
      description: '选项面板关闭时',
    },
  },
  exposes: {
    query: {
      name: '搜索内容',
      schema: z.string(),
    },
    updateQuery: {
      name: '更新搜索内容',
      schema: z.instanceof(Function),
    },
    results: {
      name: '搜索结果',
      schema: z.any() as z.ZodType<FuseResults>,
    },
  },
  slots: ({ comp }: any) => {
    const res = [] as CxComponentSlot[]

    res.push({
      key: 'empty-state',
      name: '空状态',
    })

    const groups = comp.data?.groups || []
    groups.map((group: any) => {
      res.push(
        {
          key: `${group.key}-icon`,
          name: `${group.label}图标`,
          binds: slotBinds,
        },
        {
          key: `${group.key}-command`,
          name: `${group.label}选项`,
          binds: slotBinds,
        },
        {
          key: `${group.key}-active`,
          name: `${group.label}激活选项`,
          binds: slotBinds,
        },
        {
          key: `${group.key}-inactive`,
          name: `${group.label}非激活选项`,
          binds: slotBinds,
        },
      )
    })

    return res.filter(Boolean)
  },
})
