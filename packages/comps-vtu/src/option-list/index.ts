import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '选项列表',
  description: '可选列表，单选/多选，含选择约束与 change/action 事件，支持 v-model。',
  key: 'cx-vtu-option-list',
  icon: 'i-tabler-list-check',
  component,
  props: {
    selectionMode: {
      name: '选择模式',
      type: 'card-selector',
      isPreview: true,
      initial: 'single',
      options: [
        { label: '单选', value: 'single' },
        { label: '多选', value: 'multi' },
      ],
    },
    options: {
      name: '选项',
      type: 'json',
      initial: () => [
        { id: 'opt-1', label: '选项一', description: '第一个选项' },
        { id: 'opt-2', label: '选项二', description: '第二个选项' },
      ],
    },
    minSelections: {
      name: '最少选择',
      type: 'number',
      initial: 0,
    },
    maxSelections: {
      name: '最多选择',
      type: 'number',
      initial: 1,
    },
  },
})
