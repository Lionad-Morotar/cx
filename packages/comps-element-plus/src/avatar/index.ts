import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '头像',
  description: 'Element Plus 头像，展示图片或文字占位；src/size/shape 对应 EP 同名 prop。',
  key: 'cx-element-plus-avatar',
  icon: 'i-tabler-user',
  component,
  props: {
    src: {
      name: '图片地址',
      type: 'short',
      initial: '',
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' },
      ],
    },
    shape: {
      name: '形状',
      type: 'card-selector',
      isPreview: true,
      initial: 'circle',
      options: [
        { label: '圆形', value: 'circle' },
        { label: '方形', value: 'square' },
      ],
    },
    alt: {
      name: '替代文本',
      type: 'short',
      initial: '',
    },
  },
})
