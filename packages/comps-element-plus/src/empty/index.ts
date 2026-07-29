import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '空状态',
  description: 'Element Plus 空状态占位，数据为空时的占位展示；description 对应 EP 同名 prop。',
  key: 'cx-element-plus-empty',
  icon: 'i-tabler-inbox',
  component,
  props: {
    description: {
      name: '描述文案',
      type: 'short',
      initial: '暂无数据',
    },
  },
})
