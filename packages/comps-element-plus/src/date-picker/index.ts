import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '日期选择',
  description:
    'Element Plus 日期选择器；modelValue 经 data 注入，type/format/placeholder 对应 EP 同名 prop。',
  key: 'cx-element-plus-date-picker',
  icon: 'i-tabler-calendar',
  component,
  props: {
    type: {
      name: '选择粒度',
      type: 'select',
      initial: 'date',
      options: [
        { label: '日', value: 'date' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
        { label: '日期时间', value: 'datetime' },
      ],
    },
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请选择日期',
    },
    format: {
      name: '显示格式',
      type: 'short',
      initial: 'YYYY-MM-DD',
    },
    valueFormat: {
      // EP 缺省 value-format 时上行 emit Date 对象，与低代码侧字符串数据形态错配；
      // 默认给字符串格式，消费方需要 Date 时可清空此配置
      name: '上行值格式',
      type: 'short',
      initial: 'YYYY-MM-DD',
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
