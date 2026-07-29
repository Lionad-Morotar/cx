import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '数字输入',
  description:
    'Element Plus 数字输入框，仅允许录入数字；modelValue 经 data 注入，min/max/step 对应 EP 同名 prop。',
  key: 'cx-element-plus-input-number',
  icon: 'i-tabler-number',
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
    precision: {
      name: '小数精度',
      type: 'number',
      initial: 0,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
