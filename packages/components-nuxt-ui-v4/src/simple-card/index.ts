import { normalize } from '@cx/definition'
import component from './src/index.vue'

export default normalize({
  name: '简单卡片',
  description: '简单的容器，可以容纳其它组件并设置标题、背景色等样式，是排列布局和丰富版面的好帮手',
  key: 'cx-simple-card',
  icon: 'i-lucide-credit-card',
  component,
  props: {
    name: {
      name: '标题',
      type: 'short',
      initial: '卡片标题',
    },
    description: {
      name: '副标题',
      type: 'short',
      initial: '卡片副标题',
    },
    tip: {
      name: '提示',
      type: 'short',
      initial: '',
    },
  },
  slots: {
    default: {
      key: 'default',
      name: '主要内容区',
    },
  },
})
