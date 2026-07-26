import { normalize, translate } from '@lionad/cx-definition'
import component from './todo-card.vue'
import { useTodoCardEditType } from './hooks/index'

const _comp = normalize({
  name: translate('会议代办'),
  description: translate('展示用户在给定周会的代办记录，可以展示文本编辑和 TodoList 两种形式'),
  key: 'cx-todo-card',
  component,
  async: true,
})

const comp = Object.assign(_comp, {
  useTodoCardEditType,
})

export default comp
