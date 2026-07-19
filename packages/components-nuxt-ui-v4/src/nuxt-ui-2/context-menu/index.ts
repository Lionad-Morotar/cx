import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import panelActions from './panel/actions.vue'

// todo 和 p-context-actions 合并
export default normalize({
  key: 'cx-context-menu',
  name: '右键菜单',
  description: '显示在右键点击时出现的菜单。',
  icon: 'i-tabler-menu-2',
  component,
  props: {
    actions: {
      type: 'custom',
      name: '菜单项',
      help: '编辑模式下，左键双击展开菜单项',
      component: panelActions,
      initial: () => [],
    },
  },
  emits: {
    close: {
      name: '关闭',
      description: '右键菜单关闭时触发',
    },
  },
  slots: {
    'trigger-area': {
      key: 'trigger-area',
      name: '触发区域',
    },
  },
})
