import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-input-rating',
  name: '评分',
  description: 'Nuxt UI v4 评分输入，星级收集用户评分；物料层 value 单向映射 default-value',
  icon: 'i-tabler-star',
  component,
  props: {
    value: {
      name: '当前值',
      type: 'number',
      initial: 3,
    },
    length: {
      name: '星数',
      type: 'number',
      initial: 5,
    },
    step: {
      name: '步长',
      type: 'number',
      initial: 1,
    },
    clearable: {
      name: '可清除',
      type: 'switch',
    },
    hoverable: {
      name: '悬停预览',
      type: 'switch',
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: 'i-lucide-star',
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '中性', value: 'neutral' },
      ],
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
