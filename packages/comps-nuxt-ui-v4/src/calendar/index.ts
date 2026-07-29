import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-calendar',
  name: '日历',
  description:
    'Nuxt UI v4 日历，单日/多日/范围选择；日期值由宿主 @internationalized/date 驱动，物料层聚焦展示配置',
  icon: 'i-tabler-calendar',
  component,
  props: {
    type: {
      name: '选择粒度',
      type: 'card-selector',
      isPreview: true,
      initial: 'date',
      options: [
        { label: '日', value: 'date' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
      ],
    },
    multiple: {
      name: '多选',
      type: 'switch',
    },
    range: {
      name: '范围选择',
      type: 'switch',
    },
    numberOfMonths: {
      name: '月份数',
      type: 'number',
      initial: 1,
    },
    fixedWeeks: {
      name: '固定周数',
      type: 'switch',
    },
    weekNumbers: {
      name: '周序号',
      type: 'switch',
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
})
