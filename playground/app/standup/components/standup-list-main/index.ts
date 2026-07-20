import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会列表左侧主区域：滚动容器 + 内部网格（当期标题 / 分组列表插槽 / 历史标题 / 历史区）。
 * 分组列表经默认插槽传入（cx-standup-group-list），标题与历史为本区固定内容。
 */
export default normalize({
  name: translate('站会列表主区域'),
  description: translate('站会列表左侧滚动区域：当期分组列表插槽与历史站会'),
  key: 'cx-standup-list-main',
  component,
  async: true,
})
