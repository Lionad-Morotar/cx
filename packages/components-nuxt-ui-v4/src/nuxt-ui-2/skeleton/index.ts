import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-skeleton',
  name: '加载占位',
  description: '加载占位可以让你在数据加载时展示一个占位的骨架。',
  icon: 'i-icon-park-outline-loading-one',
  component,
  props: {
    type: {
      type: 'card-selector',
      name: '类型',
      isPreview: true,
      options: [
        { value: 1, label: '图片列表' },
        { value: 2, label: '文字列表' }
      ],
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5'
      }
    },
    noAnimation: {
      type: 'boolean',
      name: '关闭动画'
    },
    padded: {
      type: 'boolean',
      name: '内边距'
    }
  }
})
