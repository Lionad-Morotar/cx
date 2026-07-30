import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '选择器',
  description:
    'Naive UI 下拉选择；options 为选项数组（label/value），value 经 data 注入，onChange 落 naive 函数型 prop（载荷 value + option）。',
  key: 'cx-naive-ui-select',
  icon: 'i-tabler-select',
  component,
  props: {
    options: {
      name: '选项',
      type: 'json',
      initial: () => [
        { label: '选项一', value: 'opt1' },
        { label: '选项二', value: 'opt2' },
      ],
    },
    value: {
      name: '值',
      type: 'short',
      initial: '',
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
    filterable: {
      name: '可搜索',
      type: 'boolean',
      initial: false,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
