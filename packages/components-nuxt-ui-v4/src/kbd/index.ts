import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '键盘按键',
  description:
    'Nuxt UI v4 键盘按键，展示快捷键；prop 名 value（v4 真实 API，spec 的 content 已按 v4 源码对齐为 value）',
  key: 'cx-nuxt-ui-v4-kbd',
  icon: 'i-tabler-keyboard',
  component,
  props: {
    value: {
      name: '按键值',
      type: 'short',
      initial: '⌘K',
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'neutral',
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
      initial: 'outline',
      options: [
        { label: '实心', value: 'solid' },
        { label: '线框', value: 'outline' },
        { label: '柔和', value: 'soft' },
        { label: '次级', value: 'subtle' },
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
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
