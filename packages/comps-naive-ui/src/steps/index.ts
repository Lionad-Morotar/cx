import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '步骤',
  description: 'Naive UI 步骤条；steps 为步骤数组（title/description），active 为当前步骤序号（1 起，naive current 约定）。',
  key: 'cx-naive-ui-steps',
  icon: 'i-tabler-stairs-up',
  component,
  props: {
    steps: {
      name: '步骤',
      type: 'json',
      initial: () => [
        { title: '填写信息', description: '填写基本信息' },
        { title: '确认提交', description: '核对后提交' },
        { title: '完成', description: '等待处理结果' },
      ],
    },
    active: {
      name: '当前步骤',
      type: 'number',
      initial: 1,
    },
    status: {
      name: '当前状态',
      type: 'select',
      initial: 'process',
      options: [
        { label: '进行中', value: 'process' },
        { label: '已完成', value: 'finish' },
        { label: '错误', value: 'error' },
        { label: '等待', value: 'wait' },
      ],
    },
  },
})
