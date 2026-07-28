import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-popover',
  name: '气泡',
  description: 'Nuxt UI v4 气泡卡片，点击或悬停触发的弹出层',
  icon: 'i-carbon-popup',
  component,
  props: {
    open: {
      name: '打开',
      type: 'boolean',
      initial: false,
    },
    mode: {
      name: '触发方式',
      type: 'card-selector',
      isPreview: true,
      initial: 'click',
      options: [
        { label: '点击', value: 'click' },
        { label: '悬停', value: 'hover' },
      ],
    },
    // v4 通过 content.side 控制方位（非顶级 placement prop）；物料层将 placement 映射为 content.side
    placement: {
      name: '方位',
      type: 'short',
      initial: 'top',
      help: '可选：top / right / bottom / left',
    },
  },
  slots: {
    // v4 Popover 的 #default 是 trigger slot；#anchor 是编程式锚点
    default: { key: 'default', name: '触发区域' },
    content: { key: 'content', name: '气泡内容' },
    anchor: { key: 'anchor', name: '锚点' },
  },
})
