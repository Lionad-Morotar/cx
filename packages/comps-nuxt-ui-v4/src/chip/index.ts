import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '标签',
  description:
    'Nuxt UI v4 Chip 角标，附在子元素上的标记；v4 Chip 无 variant prop（spec 的 variant 已按 v4 源码去除），由 color/size/position 控制',
  key: 'cx-nuxt-ui-v4-chip',
  icon: 'i-tabler-pin',
  component,
  props: {
    text: {
      name: '角标文本',
      type: 'short',
      initial: 'NEW',
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
    position: {
      name: '位置',
      type: 'card-selector',
      isPreview: true,
      initial: 'top-right',
      options: [
        { label: '右上', value: 'top-right' },
        { label: '左上', value: 'top-left' },
        { label: '右下', value: 'bottom-right' },
        { label: '左下', value: 'bottom-left' },
      ],
    },
  },
  slots: {
    default: { key: 'default', name: '宿主内容' },
    content: { key: 'content', name: '角标内容' },
  },
})
