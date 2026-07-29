import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-banner',
  name: '横幅',
  description: 'Nuxt UI v4 横幅，页面顶部重要信息展示，支持图标、颜色与关闭按钮',
  icon: 'i-tabler-ad',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '这是一条重要公告',
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: 'i-lucide-info',
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
    close: {
      name: '可关闭',
      type: 'switch',
    },
  },
  slots: {
    default: { key: 'default', name: '标题内容' },
    actions: { key: 'actions', name: '操作区' },
  },
})
