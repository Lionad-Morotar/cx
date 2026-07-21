import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

const COLOR_OPTIONS = [
  { label: '主要', value: 'primary' },
  { label: '次要', value: 'secondary' },
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
  { label: '中性', value: 'neutral' },
]

export default normalize({
  name: '开关',
  description: 'Nuxt UI v4 开关，v2 toggle 在 v4 对应 Switch，用于开启/关闭状态',
  key: 'cx-nuxt-ui-v4-toggle',
  icon: 'i-ri-toggle-line',
  component,
  props: {
    label: {
      name: '标签',
      type: 'short',
      initial: '开关',
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
  slots: {
    label: { key: 'label', name: '标签' },
  },
})
