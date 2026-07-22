import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-input-tags',
  name: '标签输入',
  description: 'Nuxt UI v4 标签输入，交互式标签列表；物料层 tags 单向映射 default-value',
  icon: 'i-tabler-tags',
  component,
  props: {
    tags: {
      name: '标签',
      type: 'custom',
      initial: () => ['标签一', '标签二'],
    },
    placeholder: {
      name: '占位文本',
      type: 'short',
      initial: '输入标签…',
    },
    maxLength: {
      name: '单标签最长',
      type: 'number',
      initial: 12,
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: '',
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
