import { normalize } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

export default normalize({
  key: 'cx-button-group',
  name: '按钮组',
  description: '将多个按钮组织成一组，常用于分段操作、分页或工具栏等并列场景',
  icon: 'i-tabler-row-insert-left',
  component,
  props: {
    orientation: {
      type: 'card-selector',
      name: '方向',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl'),
    },
  },
  slots: {
    default: {
      key: 'default',
      name: '按钮子项',
      help: '在子项区域放置多个按钮物料，即可组成按钮组',
    },
  },
})
