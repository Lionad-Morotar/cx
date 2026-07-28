import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '图标',
  description: 'Nuxt UI v4 图标，基于 @nuxt/icon 渲染',
  key: 'cx-nuxt-ui-v4-icon',
  icon: 'i-tabler-star',
  component,
  props: {
    name: {
      name: '图标名',
      type: 'short',
      initial: 'i-lucide-check',
    },
    size: {
      name: '尺寸',
      type: 'short',
      initial: '24px',
    },
  },
})
