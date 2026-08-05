import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会列表页布局容器：提供三区域 grid（顶栏 / 左侧列表 / 项目成员），
 * schema 子节点经 display:contents 包装层直接成为 grid 项。
 */
export default define({
  name: translate('站会列表布局'),
  description: translate('站会列表页的三区域网格布局容器'),
  key: 'cx-standup-list-layout',
  icon: 'i-tabler-layout-columns',
  component,
  async: true,
  // 三区域 grid 的子节点统一经默认插槽传入（display:contents 包装层直挂 grid 项）
  slots: {
    default: { key: 'default', name: translate('默认插槽') },
  },
})
