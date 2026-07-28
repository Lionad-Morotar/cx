import { define, translate } from '@lionad/cx-definition'
import component from './issue-table.vue'

export default define({
  name: translate('任务表格'),
  description: translate('展示任务名称、状态、标签、参与人、花费时间等指标的表格组件'),
  key: 'cx-view-issues-table',
  component,
  async: true,
})
