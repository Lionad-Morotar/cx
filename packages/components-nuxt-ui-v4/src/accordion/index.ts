import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '折叠面板',
  description:
    'Nuxt UI v4 折叠面板；cx 层 multiple 布尔映射到 v4 type（single/multiple）；items 为展开项数据源（v4 必需，spec 未列已按 v4 能力补齐）；v4 无 item slot（spec 所列已去除），default/leading/trailing/content 透传',
  key: 'cx-nuxt-ui-v4-accordion',
  icon: 'i-tabler-layout-list',
  component,
  props: {
    items: {
      name: '项目',
      type: 'custom',
      initial: () => [
        { label: '项目一', content: '项目一的内容' },
        { label: '项目二', content: '项目二的内容' },
      ],
    },
    multiple: {
      name: '多选',
      type: 'switch',
    },
    collapsible: {
      name: '可折叠',
      type: 'switch',
      initial: true,
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
  slots: {
    default: { key: 'default', name: '标题内容' },
    leading: { key: 'leading', name: '内容前' },
    trailing: { key: 'trailing', name: '内容后' },
    content: { key: 'content', name: '展开内容' },
  },
})
