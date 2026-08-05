import { define, translate } from '@lionad/cx-definition'
import component from './weekly-main-content.vue'

export default define({
  name: translate('周会预制标签卡片'),
  description: translate('用于展示本周和下周的任务统计以及任务表格'),
  key: 'cx-weekly-main-content',
  icon: 'i-tabler-layout-2',
  component,
  async: true,
})
