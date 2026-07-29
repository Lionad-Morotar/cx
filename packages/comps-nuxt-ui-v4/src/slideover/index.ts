import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-slideover',
  name: '侧边抽屉',
  description: 'Nuxt UI v4 侧边抽屉，从侧边滑出的交互层',
  icon: 'i-material-symbols-light-transition-slide-outline-sharp',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '抽屉标题',
    },
    open: {
      name: '打开',
      type: 'boolean',
      initial: false,
    },
    side: {
      name: '滑出方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'right',
      options: [
        { label: '右', value: 'right' },
        { label: '左', value: 'left' },
      ],
    },
  },
  slots: {
    // v4 Slideover 的 #default 是 trigger slot（包裹在 DialogTrigger as-child 中）
    default: { key: 'default', name: '触发区域' },
    header: { key: 'header', name: '头部' },
    body: { key: 'body', name: '主体内容' },
    footer: { key: 'footer', name: '底部' },
    title: { key: 'title', name: '标题' },
    description: { key: 'description', name: '描述' },
  },
})
