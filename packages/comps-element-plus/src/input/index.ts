import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '输入框',
  description:
    'Element Plus 单行输入框；modelValue 经 data 注入，input/change 经原生事件通道上行。',
  key: 'cx-element-plus-input',
  icon: 'i-tabler-input-search',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请输入',
    },
    type: {
      name: '输入类型',
      type: 'select',
      initial: 'text',
      options: [
        { label: '文本', value: 'text' },
        { label: '多行', value: 'textarea' },
        { label: '密码', value: 'password' },
      ],
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
    maxlength: {
      name: '最大长度',
      type: 'number',
      initial: 200,
    },
  },
})
