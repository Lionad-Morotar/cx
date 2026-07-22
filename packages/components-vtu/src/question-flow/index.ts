import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '问答流',
  description:
    '多步问答流（upfront 模式），steps 各含标题与至少一个选项，含 select/complete 事件。',
  key: 'cx-vtu-question-flow',
  icon: 'i-tabler-help-circle',
  component,
  props: {
    steps: {
      name: '问题步骤',
      type: 'json',
      initial: () => [
        {
          id: 'q1',
          title: '你偏好哪种渲染方式？',
          selectionMode: 'single',
          options: [
            { id: 'a', label: 'Schema 驱动' },
            { id: 'b', label: '手写组件' },
          ],
        },
      ],
    },
  },
})
