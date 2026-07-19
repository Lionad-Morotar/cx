import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-link',
  name: '链接',
  description: '链接组件用于展示一个链接，可以是外部链接或者内部链接',
  icon: 'i-ant-design-link-outlined',
  component,
  props: {
    label: {
      type: 'short',
      name: '文本',
      initial: '链接'
    },
    to: {
      type: 'short',
      name: '前往'
    },
    openInNew: {
      type: 'boolean',
      name: '新窗口打开'
    }
  },
  slots: {
    default: {
      key: 'default',
      name: '链接内容',
      binds: {
        isActive: {
          name: '是否激活',
          description: '当前项是否激活',
          schema: z.boolean()
        }
      }
    }
  }
})
