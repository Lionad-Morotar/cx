import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '徽标',
  description: 'Naive UI 徽标数；content 经 default slot 注入宿主内容，value/max/dot/type 对应同名 prop。',
  key: 'cx-naive-ui-badge',
  icon: 'i-tabler-notification',
  component,
  props: {
    content: {
      name: '宿主内容',
      type: 'short',
      initial: '消息',
    },
    value: {
      name: '徽标值',
      type: 'short',
      initial: '8',
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 99,
    },
    dot: {
      name: '圆点',
      type: 'boolean',
      initial: false,
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'error',
      options: [
        { label: '默认', value: 'default' },
        { label: '主要', value: 'primary' },
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
      ],
    },
  },
})
