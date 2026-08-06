import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
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
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    select: { name: '选项选择', description: '勾选/取消选项,宿主回写「问题 <stepId> 选择 <选项>」' },
    back: { name: '返回上一步', description: '点击返回,宿主回写「返回到上一步」' },
    'step-change': { name: '步骤切换', description: '步骤推进或回退,宿主回写「切换到步骤 <stepId>」' },
    complete: { name: '流程完成', description: '全部步骤作答完成,宿主回写各题答案汇总' },
  },
})
