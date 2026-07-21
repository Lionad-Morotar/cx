import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-modal',
  name: '弹窗',
  description: 'Nuxt UI v4 模态弹窗，打断流程引导用户完成下一步操作',
  icon: 'i-material-symbols-light-multimodal-hand-eye-outline',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '弹窗标题',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '弹窗描述内容',
    },
    open: {
      name: '打开',
      type: 'boolean',
      initial: false,
    },
    // v4 用 overlay 控制遮罩；spec 的 preventOverlay 与之反向语义（true 表示不要遮罩）
    preventOverlay: {
      name: '隐藏遮罩',
      type: 'boolean',
      initial: false,
      help: '开启后弹窗不显示背景遮罩层',
    },
    // v4 用 dismissible 控制点击外部/ESC 是否可关闭（默认 true），映射 spec 的 closable
    closable: {
      name: '可关闭',
      type: 'boolean',
      initial: true,
      help: '点击遮罩或按 ESC 是否允许关闭',
    },
  },
  slots: {
    // v4 Modal 的 #default 是 trigger slot（包裹在 DialogTrigger as-child 中）
    default: { key: 'default', name: '触发区域' },
    header: { key: 'header', name: '头部' },
    body: { key: 'body', name: '主体内容' },
    footer: { key: 'footer', name: '底部' },
    title: { key: 'title', name: '标题' },
    description: { key: 'description', name: '描述' },
  },
})
