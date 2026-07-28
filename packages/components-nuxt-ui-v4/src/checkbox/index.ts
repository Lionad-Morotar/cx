import { define } from '@lionad/cx-definition'
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

export default define({
  name: '复选框',
  description: 'Nuxt UI v4 复选框，用于二值或多选状态标记',
  key: 'cx-nuxt-ui-v4-checkbox',
  icon: 'i-ri-checkbox-line',
  component,
  props: {
    label: {
      name: '标签',
      type: 'short',
      initial: '选项',
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
