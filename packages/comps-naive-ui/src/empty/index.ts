import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '空状态',
  description: 'Naive UI 空状态占位；description/size 对应同名 prop。',
  key: 'cx-naive-ui-empty',
  icon: 'i-tabler-box',
  component,
  props: {
    description: {
      name: '描述',
      type: 'short',
      initial: '暂无数据',
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
