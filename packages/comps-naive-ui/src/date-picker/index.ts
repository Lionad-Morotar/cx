import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '日期选择',
  description:
    'Naive UI 日期选择；formattedValue 为字符串值（低代码常模），valueFormat 为 date-fns 格式（yyyy-MM-dd），变更经 update:formatted-value 桥接为字符串载荷上行。',
  key: 'cx-naive-ui-date-picker',
  icon: 'i-tabler-calendar',
  component,
  props: {
    formattedValue: {
      name: '日期值',
      type: 'short',
      // initial 为合法日期示例：dev 验收页对空 short 回填「<物料名>示例」文本，
      // 非法值会触发 naive date-fns 解析抛错（wrapper 守卫兜底但预览为空），合法示例使预览直观
      initial: '2026-01-01',
    },
    valueFormat: {
      name: '值格式',
      type: 'short',
      initial: 'yyyy-MM-dd',
    },
    type: {
      name: '类型',
      type: 'select',
      initial: 'date',
      options: [
        { label: '日期', value: 'date' },
        { label: '日期时间', value: 'datetime' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
      ],
    },
    clearable: {
      name: '可清空',
      type: 'boolean',
      initial: true,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
