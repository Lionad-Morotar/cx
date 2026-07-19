import z from 'zod'
import { normalize, CxEvents , has} from '@lionad/cx-definition'
import ItemsForm from './panel/items.vue'
import component from './src/index.vue'
import CxButton from '../button'
import { createItem } from './utils'
import { slotBinds } from './slots'
import type { CxComponentSlot } from '@lionad/cx-definition'

export default normalize({
  name: '手风琴',
  description: '显示可切换的折叠面板',
  key: 'cx-accordion',
  icon: 'i-mdi-list-box-outline',
  component,
  props: {
    items: {
      name: '项目',
      type: 'custom',
      component: ItemsForm,
      initial: () => [createItem({
        label: '标题',
        content: '内容'
      })],
      help: '向插槽中添加组件以覆盖这些内容'
    },
    multiple: {
      name: '多选',
      type: 'switch'
    },
    defaultClose: {
      name: '默认折叠',
      type: 'switch'
    },
    openIcon: {
      name: '展开时图标',
      type: 'icon',
      hidden: ({ cmpt }: any) => has(cmpt.components?.default?.length)
    },
    closeIcon: {
      name: '折叠时图标',
      type: 'icon',
      hidden: ({ cmpt }: any) => has(cmpt.components?.default?.length)
    },
    variant: {
      ...CxButton._cx_meta.props.variant!,
      hidden: ({ cmpt }: any) => has(cmpt.components?.default?.length),
      pickData: ({ data }: any) => {
        return {
          ...data,
          items: (data.items || []).slice(0, 1)
        }
      }
    },
    size: {
      ...CxButton._cx_meta.props.size!,
      hidden: ({ cmpt }: any) => has(cmpt.components?.default?.length),
      pickData: ({ data }: any) => {
        return {
          ...data,
          items: (data.items || []).slice(0, 1)
        }
      }
    },
    color: {
      ...CxButton._cx_meta.props.color!,
      hidden: ({ cmpt }: any) => has(cmpt.components?.default?.length),
      pickData: ({ data }: any) => {
        return {
          ...data,
          items: (data.items || []).slice(0, 1)
        }
      }
    }
  },
  emits: {
    open: {
      name: '展开',
      description: '展开了某项',
      schema: z.number()
    },
    close: {
      name: '折叠',
      description: '折叠了某项',
      schema: z.number()
    }
  },
  exposes: {
    open: {
      name: '展开',
      description: '展开某项（0、1、2...）',
      schema: z.instanceof(Function)
    },
    close: {
      name: '折叠',
      description: '折叠某项（0、1、2...）',
      schema: z.instanceof(Function)
    },
    ...CxEvents.displaySubCmpt.define
  },
  slots: ({ cmpt }: any) => {
    const res = [] as CxComponentSlot[]
    const items = cmpt?.data?.items || []
    items.map((item: any) => {
      res.push({
        name: item.label,
        key: 'item-' + item.id,
        icon: 'i-mdi-table',
        binds: slotBinds
      })
    })
    res.push({
      name: '触发按钮',
      key: 'default',
      icon: 'i-mdi-table-border',
      binds: slotBinds
    })
    return res
  }
})
