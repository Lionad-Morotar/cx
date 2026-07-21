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

// v4 InputMenu 依赖 items 渲染建议项；给非空示例以便 dev 页可见可交互效果。
const DEFAULT_ITEMS = () => [
  { label: '选项 1', value: '1' },
  { label: '选项 2', value: '2' },
  { label: '选项 3', value: '3' },
]

export default normalize({
  name: '输入菜单',
  description: 'Nuxt UI v4 可输入下拉，兼顾自由输入与建议项选择',
  key: 'cx-nuxt-ui-v4-input-menu',
  icon: 'i-ri-menu-2-line',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请输入或选择',
    },
    items: {
      name: '选项数据',
      type: 'custom',
      initial: DEFAULT_ITEMS,
    },
    // v4 InputMenu 的 valueKey 默认是 undefined（取整个对象为值）。
    // 这里显式置为 'value'，配合 { label, value } 形态的示例 items 取字段为值。
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
  },
  // spec 标记的 #option / #option-leading 在 v4 源码中实际为 #item / #item-leading，
  // 按 v4 源码为准透传。
  slots: {
    leading: { key: 'leading', name: '前缀' },
    trailing: { key: 'trailing', name: '后缀' },
    item: { key: 'item', name: '选项' },
    'item-leading': { key: 'item-leading', name: '选项前缀' },
  },
})
