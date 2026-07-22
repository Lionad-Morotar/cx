import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '数据表格',
  description: '可排序数据表格，列定义含 key/label 与格式化规则，行值为原始类型或数组。',
  key: 'cx-vtu-data-table',
  icon: 'i-tabler-table',
  component,
  props: {
    columns: {
      name: '列定义',
      type: 'json',
      initial: () => [
        { key: 'name', label: '名称', sortable: true },
        { key: 'role', label: '角色' },
        { key: 'active', label: '启用', format: { kind: 'boolean' } },
      ],
    },
    data: {
      name: '行数据',
      type: 'json',
      initial: () => [
        { name: 'Alice', role: '管理员', active: true },
        { name: 'Bob', role: '成员', active: false },
      ],
    },
    layout: {
      name: '布局',
      type: 'card-selector',
      isPreview: true,
      initial: 'auto',
      options: [
        { label: '自动', value: 'auto' },
        { label: '表格', value: 'table' },
        { label: '卡片', value: 'cards' },
      ],
    },
    emptyMessage: {
      name: '空态文案',
      type: 'short',
      initial: '暂无数据',
    },
  },
})
