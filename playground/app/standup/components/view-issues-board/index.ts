import { define, translate } from '@lionad/cx-definition'
import component from './view-issues-board.vue'

export default define({
  name: translate('任务看板栏'),
  description: translate('展示任务列表的看板栏，多个看板栏可以组合出一个完整的看板'),
  key: 'cx-view-issues-board',
  component,
  async: true,
})
