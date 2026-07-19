import { normalize, translate } from '@lionad/cx-definition'
import component from './index.vue'

export default normalize({
  name: translate('周会详情操作区域'),
  description: translate('默认周会页面右上角操作区域，有返回和全屏按钮以及当前会议计时'),
  key: 'cx-weekly-page-actions',
  component,
  async: true,
})
