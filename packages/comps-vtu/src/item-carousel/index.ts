import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
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
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    'item-click': { name: '条目点击', description: '点击条目主体,宿主回写「查看条目 <itemId>」' },
    'item-action': { name: '条目动作', description: '点击条目内动作,宿主回写「条目 <itemId> 执行 <actionId>」' },
  },
})
