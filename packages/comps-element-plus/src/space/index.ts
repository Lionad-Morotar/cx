import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '间距',
  description: 'Element Plus 间距容器，控制子物料排列与间隔；default 插槽承载子物料。',
  key: 'cx-element-plus-space',
  icon: 'i-tabler-layout-distribute-horizontal',
  component,
  props: {
    direction: {
      name: '排列方向',
      type: 'select',
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    size: {
      name: '间距大小',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '小', value: 'small' },
        { label: '默认', value: 'default' },
        { label: '大', value: 'large' },
      ],
    },
    wrap: {
      name: '自动换行',
      type: 'boolean',
      initial: false,
    },
  },
  slots: {
    default: { key: 'default', name: '子内容' },
  },
})
