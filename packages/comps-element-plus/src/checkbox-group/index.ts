import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '多选组',
  description:
    'Element Plus 多选组；options 为候选数组（label/value），modelValue 为已选值数组，change 经原生事件通道上行。',
  key: 'cx-element-plus-checkbox-group',
  icon: 'i-tabler-checkbox',
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
