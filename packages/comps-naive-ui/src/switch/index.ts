import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '开关',
  description: 'Naive UI 开关；value 经 data 注入，变更经 update:value 桥接至 onChange 上行。',
  key: 'cx-naive-ui-switch',
  icon: 'i-tabler-toggle-right',
  component,
  props: {
    value: {
      name: '值',
      type: 'boolean',
      initial: false,
    },
    round: {
      name: '圆角',
      type: 'boolean',
      initial: true,
    },
    loading: {
      name: '加载中',
      type: 'boolean',
      initial: false,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
