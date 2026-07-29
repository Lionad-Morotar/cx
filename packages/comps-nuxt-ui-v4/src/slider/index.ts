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
  name: '滑块',
  description: 'Nuxt UI v4 滑块，v2 range 在 v4 对应 Slider，在区间内拖动取值',
  key: 'cx-nuxt-ui-v4-slider',
  icon: 'i-ri-slider-h-line',
  component,
  props: {
    min: {
      name: '最小值',
      type: 'number',
      initial: 0,
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 100,
    },
    step: {
      name: '步长',
      type: 'number',
      initial: 1,
    },
    // v4 USlider 通过 defineModel 接管 modelValue；物料以 defaultValue 注入初始值，
    // 因 spec prop 名为 value，此处映射到 v4 的 default-value 以保持非受控初值。
    value: {
      name: '初始值',
      type: 'number',
      initial: 50,
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
  },
})
