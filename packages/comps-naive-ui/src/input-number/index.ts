import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '数字输入',
  description:
    'Naive UI 数字输入框；value 经 data 注入（number|null），onChange 落 naive 函数型 prop 于提交态调用。',
  key: 'cx-naive-ui-input-number',
  icon: 'i-tabler-123',
  component,
  props: {
    value: {
      name: '值',
      type: 'number',
      initial: 0,
    },
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请输入数字',
    },
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
