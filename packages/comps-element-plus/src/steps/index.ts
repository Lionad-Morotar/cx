import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '步骤条',
  description:
    'Element Plus 步骤条，引导分步流程；steps 为步骤数组（title/description/status），active 为当前步序号。',
  key: 'cx-element-plus-steps',
  icon: 'i-tabler-stairs-up',
  component,
  props: {
    active: {
      name: '当前步骤（从 0 起）',
      type: 'number',
      initial: 0,
    },
    steps: {
      name: '步骤',
      type: 'json',
      initial: () => [{ title: '第一步' }, { title: '第二步' }, { title: '第三步' }],
    },
    direction: {
      name: '方向',
      type: 'select',
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    alignCenter: {
      name: '居中对齐',
      type: 'boolean',
      initial: true,
    },
  },
})
