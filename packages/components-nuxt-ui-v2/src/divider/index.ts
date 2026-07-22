import { normalize, has } from '@lionad/cx-definition'
import component from './src/index.vue'
import { useSizeOptions } from '@lionad/cx-vue'

export default normalize({
  key: 'cx-divider',
  name: '分隔',
  description: '在内容间插入分隔线',
  icon: 'i-tdesign-component-divider-vertical',
  component,
  props: {
    label: {
      type: 'short',
      name: '文本',
      initial: '分隔',
      hidden: ({ cmpt }: any) => has(cmpt.data?.icon),
    },
    icon: {
      type: 'icon',
      name: '图标',
      hidden: ({ cmpt }: any) => has(cmpt.data?.label),
    },
    orientation: {
      type: 'card-selector',
      name: '方向',
      isPreview: true,
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    type: {
      type: 'card-selector',
      name: '类型',
      isPreview: true,
      options: [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' },
      ],
    },
    size: {
      type: 'card-selector',
      name: '粗细',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl'),
    },
  },
  slots: {
    default: {
      key: 'default',
      name: '分隔线内容',
    },
  },
})
