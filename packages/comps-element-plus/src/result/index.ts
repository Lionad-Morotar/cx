import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '结果',
  description: 'Element Plus 结果页，反馈操作结果；icon/title/subTitle 对应 EP 同名 prop。',
  key: 'cx-element-plus-result',
  icon: 'i-tabler-circle-check',
  component,
  props: {
    icon: {
      name: '结果类型',
      type: 'select',
      initial: 'success',
      options: [
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '信息', value: 'info' },
        { label: '错误', value: 'error' },
      ],
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '操作成功',
    },
    subTitle: {
      name: '副标题',
      type: 'short',
      initial: '',
    },
  },
})
