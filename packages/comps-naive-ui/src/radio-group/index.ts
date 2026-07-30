import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '单选组',
  description: 'Naive UI 单选组；options 为选项数组（label/value），value 经 data 注入，变更经 update:value 桥接上行。',
  key: 'cx-naive-ui-radio-group',
  icon: 'i-tabler-circle-dot',
  component,
  props: {
    options: {
      name: '选项',
      type: 'json',
      initial: () => [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
    },
    value: {
      name: '值',
      type: 'short',
      initial: 'a',
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
