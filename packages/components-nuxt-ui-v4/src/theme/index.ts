import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-theme',
  name: '主题',
  description:
    'Nuxt UI v4 主题覆盖（headless，无可见 UI），经 provide/inject 覆盖子组件默认 props 与插槽类名',
  icon: 'i-tabler-palette',
  headless: true,
  component,
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
