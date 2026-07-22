import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '图片画廊',
  description: '图片画廊（网格 + 灯箱），每项需 id/src/alt 与正数宽高。',
  key: 'cx-vtu-image-gallery',
  icon: 'i-tabler-layout-grid',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '作品集',
    },
    images: {
      name: '图片列表',
      type: 'json',
      initial: () => [
        {
          id: 'g1',
          src: 'https://picsum.photos/seed/a/640/480',
          alt: '图一',
          width: 640,
          height: 480,
        },
        {
          id: 'g2',
          src: 'https://picsum.photos/seed/b/640/480',
          alt: '图二',
          width: 640,
          height: 480,
        },
      ],
    },
  },
})
