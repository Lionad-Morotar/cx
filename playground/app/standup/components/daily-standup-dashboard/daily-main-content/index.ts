import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

export default normalize({
  name: translate('标准站会看板'),
  description: translate('标准站会看板，三个看板分别展示昨日任务、今日任务和代办事项'),
  key: 'cx-daily-main-content',
  component,
  async: true,
})
