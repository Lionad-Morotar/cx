import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-command-palette',
  name: '命令面板',
  description: 'Nuxt UI v4 命令面板，搜索并选择命令或选项',
  icon: 'i-tabler-command',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '搜索命令…',
    },
    // v4 CommandPalette 的数据源 prop 为 groups（每 group 含 items），以 v4 源码为准
    groups: {
      name: '命令分组',
      type: 'custom',
      initial: () => [
        {
          id: 'actions',
          label: '操作',
          items: [
            { label: '新建文件', icon: 'i-heroicons-document-plus' },
            { label: '打开设置', icon: 'i-heroicons-cog-6-tooth' },
          ],
        },
        {
          id: 'navigation',
          label: '导航',
          items: [
            { label: '返回首页', icon: 'i-heroicons-home' },
            { label: '查看文档', icon: 'i-heroicons-book-open' },
          ],
        },
      ],
    },
  },
  slots: {
    empty: { key: 'empty', name: '空状态' },
    item: { key: 'item', name: '选项' },
    'item-leading': { key: 'item-leading', name: '选项前' },
    'item-trailing': { key: 'item-trailing', name: '选项后' },
    'group-label': { key: 'group-label', name: '分组标签' },
  },
})
