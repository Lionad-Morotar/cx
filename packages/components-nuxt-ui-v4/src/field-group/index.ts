import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-field-group',
  name: '字段组',
  description: 'Nuxt UI v4 字段组，把多个按钮/输入类元素无缝拼接为一组（官方 ButtonGroup 后继）',
  icon: 'i-tabler-layout-columns',
  component,
  props: {
    orientation: {
      name: '方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
    },
  },
  slots: {
    default: { key: 'default', name: '字段元素' },
  },
})
