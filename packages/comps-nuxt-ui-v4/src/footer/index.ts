import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-footer',
  name: '页脚',
  description: 'Nuxt UI v4 响应式页脚，left / default / right 三区与 top / bottom 扩展区',
  icon: 'i-tabler-layout-bottombar',
  component,
  slots: {
    left: { key: 'left', name: '左区' },
    default: { key: 'default', name: '中区' },
    right: { key: 'right', name: '右区' },
    top: { key: 'top', name: '顶部扩展区' },
    bottom: { key: 'bottom', name: '底部扩展区' },
  },
})
