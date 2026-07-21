import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

// same with p-icon, todo, merge them into one
export default normalize({
  key: 'cx-icon',
  name: '图标',
  description: '选定图标以展示',
  icon: 'i-fluent-shapes-20-regular',
  component,
  props: {
    name: {
      type: 'icon',
      name: '图标',
      initial: 'i-fluent-shapes-20-regular',
    },
    size: {
      type: 'range',
      name: '大小',
      initial: 16,
      min: 8,
      max: 64,
      step: 1,
    },
  },
})
