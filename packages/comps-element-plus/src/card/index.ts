import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '卡片',
  description: 'Element Plus 卡片容器；default 插槽承载主体子物料，header 插槽承载头部子物料。',
  key: 'cx-element-plus-card',
  icon: 'i-tabler-cards',
  component,
  props: {
    shadow: {
      name: '阴影时机',
      type: 'select',
      initial: 'always',
      options: [
        { label: '始终', value: 'always' },
        { label: '悬停', value: 'hover' },
        { label: '从不', value: 'never' },
      ],
    },
  },
  // 对象形态 slots meta 经 mapValues 只产出显式声明的键：default 必须与 header 同时声明，
  // 否则渲染器不会为默认插槽生成 cx-render-components，子物料永不渲染
  slots: {
    default: { key: 'default', name: '主体内容' },
    header: { key: 'header', name: '头部' },
  },
})
