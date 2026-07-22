import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-avatar-group',
  name: '头像组',
  description: 'Nuxt UI v4 头像组，堆叠多个头像，max 限制展示数量、溢出折叠为 +N',
  icon: 'i-tabler-users-group',
  component,
  props: {
    max: {
      name: '最大展示数',
      type: 'number',
      initial: 3,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: '2xs', value: '2xs' },
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
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
    default: { key: 'default', name: '头像列表' },
  },
})
