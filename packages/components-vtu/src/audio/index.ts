import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '音频',
  description: '音频播放器，支持封面、时长、紧凑/完整变体与播放事件。',
  key: 'cx-vtu-audio',
  icon: 'i-tabler-player-play',
  component,
  props: {
    assetId: {
      name: '资源 ID',
      type: 'short',
      initial: 'audio-1',
    },
    src: {
      name: '音频地址',
      type: 'short',
      initial: 'https://example.com/audio/demo.mp3',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '示例音频',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '一段用于演示的音频。',
    },
    variant: {
      name: '变体',
      type: 'card-selector',
      isPreview: true,
      initial: 'full',
      options: [
        { label: '完整', value: 'full' },
        { label: '紧凑', value: 'compact' },
      ],
    },
  },
})
