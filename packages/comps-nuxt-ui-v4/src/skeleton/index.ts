import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '骨架屏',
  description:
    'Nuxt UI v4 骨架屏占位；v4 Skeleton 无 width/height prop，经 style 注入尺寸以覆盖核心可用性',
  key: 'cx-nuxt-ui-v4-skeleton',
  icon: 'i-tabler-loader-2',
  component,
  props: {
    width: {
      name: '宽度',
      type: 'short',
      initial: '100px',
    },
    height: {
      name: '高度',
      type: 'short',
      initial: '20px',
    },
  },
})
