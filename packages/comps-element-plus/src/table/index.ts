import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '表格',
  description:
    'Element Plus 表格；columns 为列定义数组（key/label/width/minWidth/sortable/align），data 为行数组。',
  key: 'cx-element-plus-table',
  icon: 'i-tabler-table',
  component,
  props: {
    columns: {
      name: '列定义',
      type: 'json',
      initial: () => [
        { key: 'name', label: '名称' },
        { key: 'role', label: '角色' },
      ],
    },
    data: {
      name: '行数据',
      type: 'json',
      initial: () => [
        { name: 'Alice', role: '管理员' },
        { name: 'Bob', role: '成员' },
      ],
    },
    border: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    stripe: {
      name: '斑马纹',
      type: 'boolean',
      initial: false,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' },
      ],
    },
  },
})
