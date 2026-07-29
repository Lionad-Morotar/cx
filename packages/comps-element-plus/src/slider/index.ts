import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '滑块',
  description:
    'Element Plus 滑块，拖动选取数值；modelValue 经 data 注入，min/max/step 对应 EP 同名 prop。',
  key: 'cx-element-plus-slider',
  icon: 'i-tabler-adjustments-horizontal',
  component,
  props: {
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
