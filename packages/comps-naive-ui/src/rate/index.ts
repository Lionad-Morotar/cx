import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '评分',
  description: 'Naive UI 评分；value 经 data 注入，变更经 update:value 桥接上行。',
  key: 'cx-naive-ui-rate',
  icon: 'i-tabler-star',
  component,
  props: {
    value: {
      name: '值',
      type: 'number',
      initial: 3,
    },
    count: {
      name: '星级数',
      type: 'number',
      initial: 5,
    },
    allowHalf: {
      name: '允许半选',
      type: 'boolean',
      initial: false,
    },
    readonly: {
      name: '只读',
      type: 'boolean',
      initial: false,
    },
  },
})
