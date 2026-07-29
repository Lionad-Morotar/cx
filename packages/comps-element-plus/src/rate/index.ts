import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '评分',
  description: 'Element Plus 评分；modelValue 经 data 注入，max/allowHalf 对应 EP 同名 prop。',
  key: 'cx-element-plus-rate',
  icon: 'i-tabler-star',
  component,
  props: {
    max: {
      name: '最大分值',
      type: 'number',
      initial: 5,
    },
    allowHalf: {
      name: '允许半选',
      type: 'boolean',
      initial: false,
    },
    disabled: {
      name: '只读',
      type: 'boolean',
      initial: false,
    },
  },
})
