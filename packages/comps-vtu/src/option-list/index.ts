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
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,
  // 经 _cx_events 把 action/change/update:modelValue 接到 host(否则交互事件永不接线)
  emits: {
    action: {
      name: '操作触发',
      description: '用户点击 actions 按钮,载荷为 (actionId, 当前选择值),宿主据此回写对话',
    },
    change: {
      name: '选择变更',
      description:
        '受控选择值变化,载荷已翻译为选项 label(单选 label / 多选 label 数组);id 受控同步走 update:modelValue',
    },
    'update:modelValue': { name: 'v-model 同步', description: '选择值双向同步' },
  },
})
