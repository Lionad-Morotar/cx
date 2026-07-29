import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '下拉选择',
  description:
    'Element Plus 下拉选择器；options 为候选数组（label/value），modelValue 经 data 注入，change 经原生事件通道上行。',
  key: 'cx-element-plus-select',
  icon: 'i-tabler-select',
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
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请选择',
    },
    clearable: {
      name: '可清空',
      type: 'boolean',
      initial: true,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
