import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '参数滑块',
  description: '参数滑块组，每个滑块需 min<max 且 value 在区间内，含 change/commit 事件。',
  key: 'cx-vtu-parameter-slider',
  icon: 'i-tabler-adjustments-horizontal',
  component,
  props: {
    sliders: {
      name: '滑块',
      type: 'json',
      initial: () => [
        { id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 42, unit: '°C' },
        { id: 'topp', label: 'Top-p', min: 0, max: 1, step: 0.05, value: 0.9, precision: 2 },
      ],
    },
  },
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    change: { name: '滑块变更', description: '任一滑块值变化,暂存为待发送上下文' },
    action: {
      name: '动作触发',
      description: '点击 actions 按钮,载荷为 (actionId, 当前值, 按钮 label),连同暂存一起回写',
    },
  },
})
