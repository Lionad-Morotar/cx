import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '视频',
  description: '视频播放器，支持封面、比例、填充模式、自动播放与跳转。',
  key: 'cx-vtu-video',
  icon: 'i-tabler-video',
  component,
  props: {
    assetId: {
      name: '资源 ID',
      type: 'short',
      initial: 'video-1',
    },
    src: {
      name: '视频地址',
      type: 'short',
      initial: 'https://example.com/video/demo.mp4',
    },
    poster: {
      name: '封面',
      type: 'short',
      initial: 'https://picsum.photos/seed/v/640/360',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '示例视频',
    },
    ratio: {
      name: '比例',
      type: 'short',
      initial: '16/9',
    },
    autoPlay: {
      name: '自动播放',
      type: 'switch',
      initial: false,
    },
  },
})
