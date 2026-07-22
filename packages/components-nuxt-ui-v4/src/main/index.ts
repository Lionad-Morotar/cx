import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-main',
  name: '主区域',
  description: 'Nuxt UI v4 主内容区，与 Header 配合撑满视口可用高度',
  icon: 'i-tabler-layout-dashboard',
  component,
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
