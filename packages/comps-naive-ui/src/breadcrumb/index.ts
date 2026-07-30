import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '面包屑',
  description: 'Naive UI 面包屑；items 为层级数组（title）。',
  key: 'cx-naive-ui-breadcrumb',
  icon: 'i-tabler-chevrons-right',
  component,
  props: {
    items: {
      name: '层级',
      type: 'json',
      initial: () => [{ title: '首页' }, { title: '列表' }, { title: '详情' }],
    },
  },
})
