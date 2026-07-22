import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '图片',
  description: '图片卡，支持比例、填充模式、标题、描述与跳转。',
  key: 'cx-vtu-image',
  icon: 'i-tabler-photo',
  component,
  props: {
    assetId: {
      name: '资源 ID',
      type: 'short',
      initial: 'image-1',
    },
    src: {
      name: '图片地址',
      type: 'short',
      initial: 'https://picsum.photos/seed/cx/640/360',
    },
    alt: {
      name: '替代文本',
      type: 'short',
      initial: '示例图片',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '示例图片',
    },
    ratio: {
      name: '比例',
      type: 'short',
      initial: '16/9',
    },
    fit: {
      name: '填充',
      type: 'card-selector',
      isPreview: true,
      initial: 'cover',
      options: [
        { label: '裁剪覆盖', value: 'cover' },
        { label: '完整包含', value: 'contain' },
      ],
    },
  },
})
