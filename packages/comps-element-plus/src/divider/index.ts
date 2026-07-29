import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '分割线',
  description:
    'Element Plus 分割线，区隔内容区块；label 为线上文本，direction/contentPosition 对应 EP 同名 prop。',
  key: 'cx-element-plus-divider',
  icon: 'i-tabler-separator',
  component,
  props: {
    label: {
      name: '线上文本',
      type: 'short',
      initial: '',
    },
    direction: {
      name: '方向',
      type: 'select',
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    contentPosition: {
      name: '文本位置',
      type: 'select',
      initial: 'center',
      options: [
        { label: '左', value: 'left' },
        { label: '中', value: 'center' },
        { label: '右', value: 'right' },
      ],
    },
  },
})
