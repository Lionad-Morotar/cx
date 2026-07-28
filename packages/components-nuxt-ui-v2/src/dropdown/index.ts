import z from 'zod'
import { define } from '@lionad/cx-definition'
import component from './src/index.vue'
import { popperPlacementOptions } from '@lionad/cx-vue'
import panelActions from '../context-menu/panel/actions.vue'

export default define({
  key: 'cx-dropdown',
  name: '下拉菜单',
  description: '展示多个选项，用户可以从中选择一个选项',
  icon: 'i-heroicons-chevron-down-20-solid',
  component,
  props: {
    label: {
      type: 'short',
      name: '按钮文本',
      initial: '下拉菜单',
    },
    hoverMode: {
      type: 'switch',
      name: '悬停打开',
    },
    direction: {
      type: 'card-selector',
      name: '打开方向',
      options: popperPlacementOptions,
    },
    items: {
      type: 'custom',
      name: '菜单项',
      component: panelActions,
      initial: () => [],
    },
  },
  slots: () => {
    return [
      {
        key: 'default',
        name: '触发区域',
        binds: {
          open: {
            name: '打开',
            description: '打开下拉菜单',
            schema: z.instanceof(Function),
          },
          disabled: {
            name: '禁用',
            description: '当前下来菜单是否被禁用',
            schema: z.boolean(),
          },
        },
      },
      // todo item slots
    ].filter(Boolean)
  },
})
