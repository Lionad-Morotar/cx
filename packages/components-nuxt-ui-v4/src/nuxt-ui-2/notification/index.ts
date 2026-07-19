import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-notification',
  name: '页面通知',
  description: '页面通知组件适合用于即时展示用户的操作反馈，如消息、警告、错误等通知信息',
  icon: 'i-ant-design-notification-outlined',
  component,
  props: {
    label: {
      type: 'short',
      name: '按钮内容',
      initial: '发送通知',
      help: '向页面通知的触发区域添加组件将会覆盖默认的触发按钮'
    },
    title: {
      type: 'short',
      name: '通知标题',
      initial: '通知标题'
    },
    description: {
      type: 'short',
      name: '通知内容',
      initial: '通知内容'
    },
    icon: {
      type: 'icon',
      name: '图标',
      initial: ''
    },
    id: {
      type: 'short',
      name: '通知标识',
      initial: '',
      help: '在页面上只会同时存在一个同标识的通知'
    },
    timeout: {
      type: 'range',
      name: '自动关闭时间（秒）',
      initial: 3,
      min: 0,
      max: 20,
      step: 1,
      help: '默认时间为 3 秒；设置为 0 时不会自动关闭；'
    }

  },
  slots: {
    title: {
      key: 'title',
      name: '通知标题',
      binds: {
        title: {
          name: '标题',
          description: '通知标题',
          schema: z.string()
        }
      }
    },
    description: {
      key: 'description',
      name: '通知内容',
      binds: {
        description: {
          name: '内容',
          description: '通知内容',
          schema: z.string()
        }
      }
    },
    trigger: {
      key: 'trigger',
      name: '触发区域'
    }
  }
})
