import { ref } from 'vue'

export const useTodoCardEditType = () => {
  const editType = ref<'text' | 'todo'>('todo')

  const switchTo = (to?: 'text' | 'todo') => {
    const isToValid = !!to && ['text', 'todo'].includes(to)
    const nextValue = editType.value === 'text' ? 'todo' : 'text'
    editType.value = isToValid ? to! : nextValue
  }

  return {
    editType,
    switchTo,
    toggle: switchTo,
  }
}
