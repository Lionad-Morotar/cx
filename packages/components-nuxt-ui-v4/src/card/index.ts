import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '卡片',
  description:
    'Nuxt UI v4 卡片容器；v4 Card 无 header-leading/header-trailing slot（spec 所列已按 v4 源码去除）',
  key: 'cx-nuxt-ui-v4-card',
  icon: 'i-tabler-credit-card',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '卡片标题',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '卡片描述',
    },
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'outline',
      options: [
        { label: '线框', value: 'outline' },
        { label: '柔和', value: 'soft' },
        { label: '次级', value: 'subtle' },
      ],
    },
  },
  slots: {
    header: { key: 'header', name: '头部' },
    default: { key: 'default', name: '内容' },
    footer: { key: 'footer', name: '底部' },
  },
})
