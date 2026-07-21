import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '按钮',
  description: 'Nuxt UI v4 按钮，触发用户交互（跳转、提交、打开弹窗等）',
  key: 'cx-nuxt-ui-v4-button',
  icon: 'i-tabler-click',
  component,
  props: {
    label: {
      name: '按钮文本',
      type: 'short',
      initial: '按钮',
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
        { label: '幽灵', value: 'ghost' },
        { label: '链接', value: 'link' },
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
    block: {
      name: '撑满',
      type: 'switch',
    },
    square: {
      name: '方形',
      type: 'switch',
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
    loading: {
      name: '加载中',
      type: 'switch',
    },
  },
  slots: {
    leading: { key: 'leading', name: '内容前' },
    default: { key: 'default', name: '内容' },
    trailing: { key: 'trailing', name: '内容后' },
  },
})
