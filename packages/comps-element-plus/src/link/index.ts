import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '链接',
  description:
    'Element Plus 文字链接；label 为链接文本，type/href/underline/disabled 对应 EP 同名 prop。',
  key: 'cx-element-plus-link',
  icon: 'i-tabler-link',
  component,
  props: {
    label: {
      name: '链接文本',
      type: 'short',
      initial: '链接',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'default',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
        { label: '默认', value: 'default' },
      ],
    },
    href: {
      name: '跳转地址',
      type: 'short',
      initial: '',
    },
    underline: {
      name: '下划线',
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
