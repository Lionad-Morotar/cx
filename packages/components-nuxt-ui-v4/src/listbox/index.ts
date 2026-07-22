import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-listbox',
  name: '列表框',
  description: 'Nuxt UI v4 列表框，可搜索/虚拟化的富渲染选项列表',
  icon: 'i-tabler-list',
  component,
  props: {
    items: {
      name: '选项',
      type: 'custom',
      initial: () => [
        { label: '选项一', value: 'a' },
        { label: '选项二', value: 'b' },
        { label: '选项三', value: 'c' },
      ],
    },
    multiple: {
      name: '多选',
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
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
