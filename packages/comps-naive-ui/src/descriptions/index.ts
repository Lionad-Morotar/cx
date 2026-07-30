import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '描述列表',
  description: 'Naive UI 描述列表；items 为条目数组（label/value/span），bordered/column/title 对应同名 prop。',
  key: 'cx-naive-ui-descriptions',
  icon: 'i-tabler-list-details',
  component,
  props: {
    items: {
      name: '条目',
      type: 'json',
      initial: () => [
        { label: '姓名', value: '张三' },
        { label: '城市', value: '上海' },
      ],
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '用户信息',
    },
    bordered: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    column: {
      name: '列数',
      type: 'number',
      initial: 2,
    },
  },
})
