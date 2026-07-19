import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-card',
  name: '卡片',
  description: '显示一个卡片，包含头部、内容和底部。',
  icon: 'i-lucide-credit-card',
  component,
  props: {},
  slots: () => {
    return [
      {
        key: 'default',
        name: '卡片内容',
      },
      {
        key: 'header',
        name: '卡片头部',
      },
      {
        key: 'footer',
        name: '卡片底部',
      },
    ].filter(Boolean)
  },
})
