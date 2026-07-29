import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '徽标',
  description:
    'Element Plus 徽标数，展示未读/计数；content 为宿主内容，value/max/isDot/type 对应 EP 同名 prop。',
  key: 'cx-element-plus-badge',
  icon: 'i-tabler-badge',
  component,
  props: {
    content: {
      name: '宿主内容',
      type: 'short',
      initial: '内容',
    },
    value: {
      name: '显示值',
      type: 'number',
      initial: 1,
    },
    max: {
      name: '最大值（超出显示 {max}+）',
      type: 'number',
      initial: 99,
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'danger',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
      ],
    },
    isDot: {
      name: '小圆点模式',
      type: 'boolean',
      initial: false,
    },
    hidden: {
      name: '隐藏徽标',
      type: 'boolean',
      initial: false,
    },
  },
})
