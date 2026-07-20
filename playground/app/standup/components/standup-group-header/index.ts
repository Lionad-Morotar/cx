import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 分组头部：渲染"第 N 周/月 + 日期范围"，点击触发所属 folder-container 折叠。
 * group 数据经 StandupGroupKey 注入，折叠上下文经 FolderContainerCtxKey 注入。
 */
export default normalize({
  name: translate('站会分组头部'),
  description: translate('展示分组序号与日期范围，点击切换折叠，数据由分组上下文注入'),
  key: 'cx-standup-group-header',
  component,
  async: true,
})
