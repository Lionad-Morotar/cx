import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-marquee',
  name: '跑马灯',
  description: 'Nuxt UI v4 跑马灯，无限滚动内容；用户偏好减弱动效时自动静态展示',
  icon: 'i-tabler-marquee',
  component,
  props: {
    pauseOnHover: {
      name: '悬停暂停',
      type: 'switch',
    },
    reverse: {
      name: '反向滚动',
      type: 'switch',
    },
    orientation: {
      name: '方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    repeat: {
      name: '重复次数',
      type: 'number',
      initial: 4,
    },
  },
  slots: {
    default: { key: 'default', name: '滚动内容' },
  },
})
