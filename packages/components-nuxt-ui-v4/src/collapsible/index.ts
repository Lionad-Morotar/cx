import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-collapsible',
  name: '折叠容器',
  description: 'Nuxt UI v4 折叠容器，切换内容区显隐；物料层 open 单向映射 v-model:open',
  icon: 'i-tabler-fold',
  component,
  props: {
    open: {
      name: '展开',
      type: 'switch',
      initial: true,
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
    unmountOnHide: {
      name: '收起时卸载',
      type: 'switch',
      initial: true,
    },
  },
  slots: {
    default: { key: 'default', name: '触发区' },
    content: { key: 'content', name: '折叠内容' },
  },
})
