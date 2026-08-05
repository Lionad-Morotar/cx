import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

export default define({
  name: translate('区域折叠组件'),
  description: translate(
    '区域折叠组件是一个分为头部和内容两部分的卡片，可以使用按钮将内容区域收起或展开',
  ),
  key: 'cx-folder-container',
  icon: 'i-tabler-folder',
  component,
  async: true,
  // 声明插槽使 schema 子节点可填入 header / content（此前仅有 SFC 内的 <slot>，
  // CxRender 只会回落默认插槽，header/content 子节点无法渲染）
  slots: {
    header: { key: 'header', name: translate('头部') },
    'header-right': { key: 'header-right', name: translate('头部右侧') },
    content: { key: 'content', name: translate('内容区域') },
    default: { key: 'default', name: translate('默认插槽') },
  },
})
