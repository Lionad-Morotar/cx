import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
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
})
