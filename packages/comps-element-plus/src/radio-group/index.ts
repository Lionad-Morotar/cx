import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '单选组',
  description:
    'Element Plus 单选组；options 为候选数组（label/value），modelValue 经 data 注入，change 经原生事件通道上行。',
  key: 'cx-element-plus-radio-group',
  icon: 'i-tabler-circle-dot',
  component,
  props: {
    options: {
      name: '候选项',
      type: 'json',
      initial: () => [
        { label: '选项一', value: 'a' },
        { label: '选项二', value: 'b' },
      ],
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
