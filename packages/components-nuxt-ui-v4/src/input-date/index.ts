import { normalize } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
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
  name: '日期选择',
  description: 'Nuxt UI v4 日期输入，v2 date-picker 在 v4 对应 InputDate',
  key: 'cx-nuxt-ui-v4-date-picker',
  icon: 'i-ri-calendar-line',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '选择日期',
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: useSizeOptions('2xs', 'xl'),
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
  },
  slots: {
    leading: { key: 'leading', name: '前缀' },
    trailing: { key: 'trailing', name: '后缀' },
  },
})
