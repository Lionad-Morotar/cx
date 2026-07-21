import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-meter',
  name: '仪表',
  description: 'Nuxt UI v4 仪表（v4 无 Meter 组件，用 UProgress 模拟 0-100 比例计量）',
  icon: 'i-carbon-meter-alt',
  component,
  props: {
    // v4 Progress 用 modelValue 控制当前值；物料层将 spec 的 value 映射为 modelValue
    value: {
      name: '当前值',
      type: 'number',
      initial: 60,
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 100,
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
    // v4 Progress 只有 #status({ percent }) slot；spec 的 indicator/complete/incomplete 在 v4 不存在
    status: { key: 'status', name: '状态指示' },
  },
})
