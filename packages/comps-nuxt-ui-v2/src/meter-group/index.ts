import { define } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

export default define({
  key: 'cx-meter-group',
  name: '计量组',
  description: '将多个计量项组合展示，适合呈现容量分布、多维进度或评分占比等场景',
  icon: 'i-carbon-meter-alt',
  component,
  props: {
    min: {
      type: 'number',
      name: '最小值',
      initial: 0,
    },
    max: {
      type: 'number',
      name: '最大值',
      initial: 100,
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', '2xl'),
    },
    indicator: {
      type: 'switch',
      name: '指示器',
      help: '在顶部显示汇总百分比',
    },
  },
  slots: {
    default: {
      key: 'default',
      name: '计量子项',
      help: '放置多个计量物料，按各自 value 在同一量程内分段显示',
    },
  },
})
