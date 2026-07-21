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

// v4 SelectMenu 依赖 items 渲染可搜索项；给非空示例以便 dev 页可见可交互效果。
const DEFAULT_ITEMS = () => [
  { label: '选项 1', value: '1' },
  { label: '选项 2', value: '2' },
  { label: '选项 3', value: '3' },
]

export default normalize({
  name: '选择菜单',
  description: 'Nuxt UI v4 可搜索下拉，在 items 中检索并选择一项或多项',
  key: 'cx-nuxt-ui-v4-select-menu',
  icon: 'i-ri-search-line',
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
    // v4 SelectMenu 的 valueKey 默认是 undefined（取整个对象为值）。
    // 这里显式置为 'value'，配合 { label, value } 形态的示例 items 取字段为值。
    valueKey: {
      name: '取值字段',
      type: 'short',
      initial: 'value',
    },
    multiple: {
      name: '多选',
      type: 'boolean',
      initial: false,
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
  // spec 标记的 #label / #option 在 v4 源码中实际为 #default（触发器显示） / #item，
  // 按 v4 源码为准透传。
  slots: {
    leading: { key: 'leading', name: '前缀' },
    default: { key: 'default', name: '触发器内容' },
    trailing: { key: 'trailing', name: '后缀' },
    item: { key: 'item', name: '选项' },
  },
})
