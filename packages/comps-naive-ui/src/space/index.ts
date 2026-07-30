import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '间距容器',
  description: 'Naive UI 间距容器；default 插槽承载并列子物料，vertical/align/justify/size 对应同名 prop。',
  key: 'cx-naive-ui-space',
  icon: 'i-tabler-layout-distribute-horizontal',
  component,
  props: {
    vertical: {
      name: '垂直排列',
      type: 'boolean',
      initial: false,
    },
    align: {
      name: '对齐',
      type: 'select',
      initial: 'center',
      options: [
        { label: '起端', value: 'start' },
        { label: '居中', value: 'center' },
        { label: '末端', value: 'end' },
        { label: '基线', value: 'baseline' },
        { label: '拉伸', value: 'stretch' },
      ],
    },
    size: {
      name: '间距',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
  },
})
