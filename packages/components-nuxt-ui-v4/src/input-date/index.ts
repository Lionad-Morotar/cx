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
  description:
    'Nuxt UI v4 日期输入；物料层将 YYYY-MM-DD 字符串映射为 default-value（CalendarDate）',
  key: 'cx-nuxt-ui-v4-input-date',
  icon: 'i-ri-calendar-line',
  component,
  props: {
    value: {
      name: '当前日期',
      type: 'short',
      initial: '2026-01-01',
    },
    // 不提供 placeholder prop：UInputDate 透传 placeholder 会在 mount 时触发
    // reka-ui 2.10.1 DateFieldRoot 的 segment 查询崩溃（querySelectorAll of null），
    // 已用三种 props 组合裸挂复现确认是上游缺陷
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
