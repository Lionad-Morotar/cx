import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-app',
  name: '应用',
  description:
    'Nuxt UI v4 应用根容器，为子组件提供全局配置（阅读方向、滚动锁等）与 Toast/Tooltip 上下文',
  icon: 'i-tabler-layout',
  component,
  props: {
    dir: {
      name: '阅读方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'ltr',
      options: [
        { label: '从左到右', value: 'ltr' },
        { label: '从右到左', value: 'rtl' },
      ],
    },
    scrollBody: {
      name: '滚动锁定',
      type: 'switch',
      initial: true,
    },
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
