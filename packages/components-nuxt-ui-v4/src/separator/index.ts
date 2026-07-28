import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '分割线',
  description: 'Nuxt UI v4 分割线（v2 divider 对应 v4 Separator）',
  key: 'cx-nuxt-ui-v4-separator',
  icon: 'i-tabler-minus',
  component,
  props: {
    label: {
      name: '文本',
      type: 'short',
      initial: '分割',
    },
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
    type: {
      name: '线型',
      type: 'card-selector',
      isPreview: true,
      initial: 'solid',
      options: [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' },
      ],
    },
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
