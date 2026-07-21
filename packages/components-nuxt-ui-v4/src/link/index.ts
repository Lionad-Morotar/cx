import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '链接',
  description: 'Nuxt UI v4 链接；v4 Link 无 label/color prop，label 经 default slot 注入（slot 为空时回退到 label），颜色由宿主 class 控制',
  key: 'cx-nuxt-ui-v4-link',
  icon: 'i-tabler-link',
  component,
  props: {
    to: {
      name: '目标地址',
      type: 'short',
      initial: '#',
    },
    label: {
      name: '文本',
      type: 'short',
      initial: '链接',
    },
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
