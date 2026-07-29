import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '开关',
  description:
    'Element Plus 开关，切换布尔状态；modelValue 经 data 注入，change 经原生事件通道上行。',
  key: 'cx-element-plus-switch',
  icon: 'i-tabler-toggle-right',
  component,
  props: {
    activeText: {
      name: '开启文案',
      type: 'short',
      initial: '',
    },
    inactiveText: {
      name: '关闭文案',
      type: 'short',
      initial: '',
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
