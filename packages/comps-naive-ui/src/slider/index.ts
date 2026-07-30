import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '滑块',
  description: 'Naive UI 滑块；value 经 data 注入，变更经 update:value 桥接上行。',
  key: 'cx-naive-ui-slider',
  icon: 'i-tabler-adjustments-horizontal',
  component,
  props: {
    value: {
      name: '值',
      type: 'number',
      initial: 40,
    },
    min: {
      name: '最小值',
      type: 'number',
      initial: 0,
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 100,
    },
    step: {
      name: '步长',
      type: 'number',
      initial: 1,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
