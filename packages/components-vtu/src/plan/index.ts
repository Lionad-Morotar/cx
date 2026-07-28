import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '计划',
  description: '执行计划清单，todos 含状态（pending/in-progress/completed），含 todoClick 事件。',
  key: 'cx-vtu-plan',
  icon: 'i-tabler-list-details',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '实施计划',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '分三步完成物料接入。',
    },
    defaultExpanded: {
      name: '默认展开',
      type: 'switch',
      initial: true,
    },
    todos: {
      name: '待办',
      type: 'json',
      initial: () => [
        { id: 't1', label: '搭建包骨架', status: 'completed' },
        { id: 't2', label: '接入组件', status: 'in-progress' },
        { id: 't3', label: '验收', status: 'pending' },
      ],
    },
  },
})
