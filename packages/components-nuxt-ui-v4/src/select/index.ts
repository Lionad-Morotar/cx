import { normalize } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

const VARIANT_OPTIONS = [
  { label: '线框', value: 'outline' },
  { label: '柔和', value: 'soft' },
  { label: '次级', value: 'subtle' },
  { label: '幽灵', value: 'ghost' },
  { label: '无', value: 'none' },
]

const COLOR_OPTIONS = [
  { label: '主要', value: 'primary' },
  { label: '次要', value: 'secondary' },
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
  { label: '中性', value: 'neutral' },
]

// v4 Select 依赖 items 渲染下拉项；给非空示例以便 dev 页可见可交互效果。
const DEFAULT_ITEMS = () => [
  { label: '选项 1', value: '1' },
  { label: '选项 2', value: '2' },
  { label: '选项 3', value: '3' },
]

export default normalize({
  name: '下拉选择',
  description: 'Nuxt UI v4 下拉选择，从 items 中择一或择多',
  key: 'cx-nuxt-ui-v4-select',
  icon: 'i-ri-arrow-down-s-line',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请选择',
    },
    items: {
      name: '选项数据',
      type: 'custom',
      initial: DEFAULT_ITEMS,
    },
    // v4 Select 的 valueKey 默认即为 'value'，当 items 为对象数组时取该字段作为值。
    valueKey: {
      name: '取值字段',
      type: 'short',
      initial: 'value',
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
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'outline',
      options: VARIANT_OPTIONS,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
  slots: {
    leading: { key: 'leading', name: '前缀' },
    trailing: { key: 'trailing', name: '后缀' },
  },
})
