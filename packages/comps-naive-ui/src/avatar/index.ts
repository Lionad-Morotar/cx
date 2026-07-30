import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '头像',
  description: 'Naive UI 头像；src 为图片地址，round/size 对应同名 prop。',
  key: 'cx-naive-ui-avatar',
  icon: 'i-tabler-user-circle',
  component,
  props: {
    src: {
      name: '图片地址',
      type: 'short',
      initial: '',
    },
    round: {
      name: '圆形',
      type: 'boolean',
      initial: true,
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
  },
})
