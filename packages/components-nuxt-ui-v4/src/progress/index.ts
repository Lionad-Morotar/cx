import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '进度条',
  description:
    'Nuxt UI v4 进度条；value 经 .vue 映射至 v4 的 modelValue（v-model），slots 以 v4 为准仅暴露 status（spec 的 indicator/complete/incomplete 在 v4 不存在）',
  key: 'cx-nuxt-ui-v4-progress',
  icon: 'i-tabler-progress',
  component,
  props: {
    value: {
      name: '当前值',
      type: 'number',
      initial: 50,
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 100,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: '2xs', value: '2xs' },
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
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
  },
  slots: {
    status: { key: 'status', name: '状态文本' },
  },
})
