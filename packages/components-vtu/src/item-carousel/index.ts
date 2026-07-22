import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '条目轮播',
  description: '条目轮播卡，支持标题/副标题/图片与操作按钮，含 itemClick/itemAction 事件。',
  key: 'cx-vtu-item-carousel',
  icon: 'i-tabler-carousel-horizontal',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '推荐条目',
    },
    items: {
      name: '条目',
      type: 'json',
      initial: () => [
        {
          id: 'i1',
          name: '条目一',
          subtitle: '副标题',
          image: 'https://picsum.photos/seed/i1/320/200',
        },
        {
          id: 'i2',
          name: '条目二',
          subtitle: '副标题',
          image: 'https://picsum.photos/seed/i2/320/200',
        },
      ],
    },
  },
})
