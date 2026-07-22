import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-checkbox-group',
  name: '复选组',
  description: 'Nuxt UI v4 复选组，从列表中选择多个选项',
  icon: 'i-tabler-checkbox',
  component,
  props: {
    items: {
      name: '选项',
      type: 'custom',
      initial: () => ['选项一', '选项二', '选项三'],
    },
    legend: {
      name: '组标题',
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
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'list',
      options: [
        { label: '列表', value: 'list' },
        { label: '卡片', value: 'card' },
      ],
    },
    orientation: {
      name: '方向',
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
      type: 'switch',
    },
  },
})
