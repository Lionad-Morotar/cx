import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '面包屑',
  description:
    'Element Plus 面包屑，显示当前页面层级；items 为层级数组（label），separator 为分隔符。',
  key: 'cx-element-plus-breadcrumb',
  icon: 'i-tabler-chevron-right-pipe',
  component,
  props: {
    items: {
      name: '层级',
      type: 'json',
      initial: () => [{ label: '首页' }, { label: '列表' }, { label: '详情' }],
    },
    separator: {
      name: '分隔符',
      type: 'short',
      initial: '/',
    },
  },
})
