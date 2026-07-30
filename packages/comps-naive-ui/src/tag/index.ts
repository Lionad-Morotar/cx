import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '标签',
  description: 'Naive UI 标签；label 经 default slot 注入，type/size/bordered/round 对应同名 prop。',
  key: 'cx-naive-ui-tag',
  icon: 'i-tabler-tag',
  component,
  props: {
    label: {
      name: '标签文本',
      type: 'short',
      initial: '标签',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
    bordered: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    round: {
      name: '圆角',
      type: 'boolean',
      initial: false,
    },
  },
})
