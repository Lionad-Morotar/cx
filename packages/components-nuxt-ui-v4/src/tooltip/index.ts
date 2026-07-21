import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-tooltip',
  name: '文字提示',
  description: 'Nuxt UI v4 文字提示，悬停展示简短说明',
  icon: 'i-tabler-tooltip',
  component,
  props: {
    text: {
      name: '提示内容',
      type: 'short',
      initial: '提示内容',
    },
    // v4 通过 content.side 控制方位（非顶级 placement prop）；物料层将 placement 映射为 content.side
    placement: {
      name: '方位',
      type: 'short',
      initial: 'top',
      help: '可选：top / right / bottom / left',
    },
    open: {
      name: '打开',
      type: 'boolean',
      initial: false,
    },
  },
  slots: {
    // v4 Tooltip 的 #default 是 trigger slot（包裹在 TooltipTrigger as-child 中）
    default: { key: 'default', name: '触发区域' },
  },
})
