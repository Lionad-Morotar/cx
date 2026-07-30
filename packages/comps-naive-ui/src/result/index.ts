import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '结果',
  description: 'Naive UI 结果页，展示操作结果状态；status/title/description/size 对应同名 prop。',
  key: 'cx-naive-ui-result',
  icon: 'i-tabler-certificate',
  component,
  props: {
    status: {
      name: '状态',
      type: 'select',
      initial: 'info',
      options: [
        { label: '信息', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '404', value: '404' },
        { label: '403', value: '403' },
        { label: '500', value: '500' },
      ],
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '操作完成',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '您的操作已成功完成',
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ],
    },
  },
})
