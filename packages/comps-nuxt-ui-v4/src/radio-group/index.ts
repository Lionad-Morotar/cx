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

// v4 RadioGroup 依赖 items 渲染选项，缺省时为空列表。此处给一个非空示例，
// 让 dev 物料页能直接看到可交互效果；使用方可覆盖为真实数据。
const DEFAULT_ITEMS = () => [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' },
]

export default define({
  name: '单选组',
  description: 'Nuxt UI v4 单选组，v2 radio 在 v4 对应 RadioGroup，从一组互斥选项中择一',
  key: 'cx-nuxt-ui-v4-radio-group',
  icon: 'i-ri-radio-button-line',
  component,
  props: {
    items: {
      name: '选项数据',
      type: 'custom',
      initial: DEFAULT_ITEMS,
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
    orientation: {
      name: '排列方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'vertical',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
      ],
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
