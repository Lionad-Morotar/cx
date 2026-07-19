import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-date-picker',
  name: '日期选择',
  description: '选择日期、时间、日期范围等',
  icon: 'i-tabler-calendar',
  component,
  props: {
    mode: {
      type: 'button-group',
      name: '模式',
      initial: 'date',
      options: [
        { label: '日期', value: 'date' },
        { label: '日期范围', value: 'date-range' }
      ]
    }
  },
  emits: {
    change: {
      name: '日期变更',
      description: '设定好日期（或日期范围）变更时触发',
      schema: z.union([
        z.date(),
        z.array(z.date()).min(2).max(2)
      ])
    },
    close: {
      name: '关闭',
      description: '关闭日期选择器面板时触发'
    }
  }
})
