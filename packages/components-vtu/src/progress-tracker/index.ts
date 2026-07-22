import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '进度追踪',
  description: '步骤进度追踪，steps 含状态（pending/in-progress/completed/failed）与耗时。',
  key: 'cx-vtu-progress-tracker',
  icon: 'i-tabler-progress',
  component,
  props: {
    elapsedTime: {
      name: '已耗时',
      type: 'short',
      initial: '00:42',
    },
    steps: {
      name: '步骤',
      type: 'json',
      initial: () => [
        { id: 's1', label: '解析', status: 'completed' },
        { id: 's2', label: '渲染', status: 'in-progress' },
        { id: 's3', label: '校验', status: 'pending' },
      ],
    },
  },
})
