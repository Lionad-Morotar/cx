import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '徽标',
  description: 'Nuxt UI v4 徽标，标注状态或分类',
  key: 'cx-nuxt-ui-v4-badge',
  icon: 'i-tabler-badge',
  component,
  props: {
    label: {
      name: '文本',
      type: 'short',
      initial: '徽标',
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
    leading: { key: 'leading', name: '内容前' },
    default: { key: 'default', name: '内容' },
    trailing: { key: 'trailing', name: '内容后' },
  },
})
