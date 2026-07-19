import { normalize, translate } from '@lionad/cx-definition'
import component from './weekly-todo-card.vue'

export default normalize({
  name: translate('周会代办卡片'),
  description: translate(
    '周会代码卡片用于展示在给定周会的对应用户的代办列表，并且你可以快速切换到上次周会',
  ),
  key: 'cx-weekly-todo-card',
  component,
  async: true,
})
