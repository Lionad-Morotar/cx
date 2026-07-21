import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '轮播',
  description: 'Nuxt UI v4 轮播（基于 Embla）；items 为轮播项数据源（v4 必需，spec 未列已按 v4 能力补齐）；item slot 经 v4 default slot 透传（带 item/index scope）',
  key: 'cx-nuxt-ui-v4-carousel',
  icon: 'i-tabler-carousel-horizontal',
  component,
  props: {
    items: {
      name: '轮播项',
      type: 'custom',
      initial: () => [
        { content: '第一项' },
        { content: '第二项' },
        { content: '第三项' },
      ],
    },
    loop: {
      name: '循环',
      type: 'switch',
      initial: true,
    },
    arrows: {
      name: '箭头',
      type: 'switch',
      initial: true,
    },
    dots: {
      name: '指示点',
      type: 'switch',
      initial: true,
    },
  },
  slots: {
    item: { key: 'item', name: '轮播项' },
  },
})
