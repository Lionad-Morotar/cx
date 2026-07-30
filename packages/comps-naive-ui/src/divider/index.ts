import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '分割线',
  description: 'Naive UI 分割线；title 经 default slot 注入线内标题，vertical/dashed/titlePlacement 对应同名 prop。',
  key: 'cx-naive-ui-divider',
  icon: 'i-tabler-separator-horizontal',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '分组标题',
    },
    titlePlacement: {
      name: '标题位置',
      type: 'select',
      initial: 'center',
      options: [
        { label: '左', value: 'left' },
        { label: '中', value: 'center' },
        { label: '右', value: 'right' },
      ],
    },
    dashed: {
      name: '虚线',
      type: 'boolean',
      initial: false,
    },
    vertical: {
      name: '垂直',
      type: 'boolean',
      initial: false,
    },
  },
})
