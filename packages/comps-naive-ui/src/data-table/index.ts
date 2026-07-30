import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '表格',
  description:
    'Naive UI 数据表格；columns 为列定义数组（key/label/width，wrapper 映射 label→naive title），data 为行数组。',
  key: 'cx-naive-ui-data-table',
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
    bordered: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    striped: {
      name: '斑马纹',
      type: 'boolean',
      initial: false,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
  },
})
