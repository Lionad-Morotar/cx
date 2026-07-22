import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-dropdown-menu',
  name: '下拉菜单',
  description: 'Nuxt UI v4 下拉菜单，点击触发展示可选项列表',
  icon: 'i-heroicons-chevron-down-20-solid',
  component,
  props: {
    // v4 通过 content.side 控制方位（非顶级 placement prop）；物料层将 placement 映射为 content.side
    placement: {
      name: '方位',
      type: 'short',
      initial: 'bottom',
      help: '可选：top / right / bottom / left',
    },
    // v4 DropdownMenu 仅支持点击触发（trigger slot），没有 hover 模式，故不暴露 spec 的 mode 选项
    items: {
      name: '菜单项',
      type: 'custom',
      initial: () => [
        { label: '编辑', icon: 'i-heroicons-pencil-square' },
        { label: '复制', icon: 'i-heroicons-document-duplicate' },
        { label: '删除', icon: 'i-heroicons-trash', color: 'red' },
      ],
    },
  },
  slots: {
    // v4 DropdownMenu 的 #default 是 trigger slot（包裹在 DropdownMenuTrigger as-child 中）
    default: { key: 'default', name: '触发区域' },
    'item-leading': { key: 'item-leading', name: '菜单项前' },
    'item-trailing': { key: 'item-trailing', name: '菜单项后' },
  },
})
