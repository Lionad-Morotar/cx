import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '容器',
  description: 'Nuxt UI v4 居中容器，约束内容最大宽度并水平居中',
  key: 'cx-nuxt-ui-v4-container',
  icon: 'i-tabler-layout',
  component,
  props: {},
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
