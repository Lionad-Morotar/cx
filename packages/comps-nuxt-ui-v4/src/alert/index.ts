import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '警告提示',
  description:
    'Nuxt UI v4 警告横幅；icon 在 v4 接收图标名（spec 的 boolean 不适用，以 v4 源码为准改用 icon 类型），v4 无 default/trailing slot 故未暴露',
  key: 'cx-nuxt-ui-v4-alert',
  icon: 'i-tabler-alert-circle',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '提示',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '这是一条提示',
    },
    icon: {
      name: '图标',
      type: 'icon',
      initial: 'i-lucide-bell-ring',
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
      initial: 'solid',
      options: [
        { label: '实心', value: 'solid' },
        { label: '线框', value: 'outline' },
        { label: '柔和', value: 'soft' },
        { label: '次级', value: 'subtle' },
      ],
    },
  },
  slots: {
    leading: { key: 'leading', name: '内容前' },
    title: { key: 'title', name: '标题' },
    description: { key: 'description', name: '描述' },
    actions: { key: 'actions', name: '操作' },
  },
})
