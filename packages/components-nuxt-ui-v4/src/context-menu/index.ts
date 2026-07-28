import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-context-menu',
  name: '右键菜单',
  description: 'Nuxt UI v4 右键上下文菜单，右键触发区域弹出操作选项',
  icon: 'i-material-symbols-arrow-selector-tool-outline',
  component,
  props: {
    // v4 ContextMenu 仅由右键触发（无显式 open/方向 prop 控制）；items 为菜单数据源
    items: {
      name: '菜单项',
      type: 'custom',
      initial: () => [
        { label: '复制', icon: 'i-heroicons-document-duplicate' },
        { label: '粘贴', icon: 'i-heroicons-clipboard' },
        { label: '删除', icon: 'i-heroicons-trash', color: 'red' },
      ],
    },
  },
  slots: {
    // v4 ContextMenu 的 #default 是 trigger slot（包裹在 ContextMenuTrigger as-child 中），右键该区域弹出菜单
    default: { key: 'default', name: '触发区域' },
  },
})
