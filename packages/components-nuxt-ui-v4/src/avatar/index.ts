import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '头像',
  description: 'Nuxt UI v4 头像，支持图片加载失败时回退到文字或图标',
  key: 'cx-nuxt-ui-v4-avatar',
  icon: 'i-tabler-user-circle',
  component,
  props: {
    src: {
      name: '图片地址',
      type: 'short',
      initial: 'https://i.pravatar.cc/100?u=cx',
    },
    alt: {
      name: '替代文本',
      type: 'short',
      initial: 'Avatar',
    },
    text: {
      name: '文字回退',
      type: 'short',
      initial: 'A',
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: '2xs', value: '2xs' },
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
    },
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
