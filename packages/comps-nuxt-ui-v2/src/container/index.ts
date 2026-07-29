import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-container',
  name: '容器',
  description: '容器可以让你居中并限制内容的宽度。',
  icon: 'i-tabler-box-margin',
  component,
  props: {},
  slots: () => {
    return [
      {
        key: 'default',
        name: '容器内',
      },
    ].filter(Boolean)
  },
})
