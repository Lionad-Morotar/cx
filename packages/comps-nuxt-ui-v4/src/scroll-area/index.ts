import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-scroll-area',
  name: '滚动区',
  description:
    'Nuxt UI v4 滚动容器，支持虚拟化长列表；物料层聚焦容器形态，item 渲染经 default slot',
  icon: 'i-tabler-scroll',
  component,
  props: {
    orientation: {
      name: '滚动方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'vertical',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
      ],
    },
    virtualize: {
      name: '虚拟化',
      type: 'switch',
    },
  },
  slots: {
    default: { key: 'default', name: '滚动内容' },
  },
})
