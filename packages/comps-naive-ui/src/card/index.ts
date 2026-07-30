import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '卡片',
  description: 'Naive UI 卡片容器；default 插槽承载主体子物料，header 插槽承载头部子物料。',
  key: 'cx-naive-ui-card',
  icon: 'i-tabler-cards',
  component,
  props: {
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
        { label: '特大', value: 'huge' },
      ],
    },
    bordered: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    hoverable: {
      name: '悬停浮起',
      type: 'boolean',
      initial: false,
    },
  },
  // 对象形态 slots meta 经 mapValues 只产出显式声明的键：default 必须与 header 同时声明，
  // 否则渲染器不会为默认插槽生成 cx-render-components，子物料永不渲染。
  // header 走插槽而非 NCard 的 title prop：wrapper 恒渲染 #header 模板会覆盖 title prop 致其失效
  slots: {
    default: { key: 'default', name: '主体内容' },
    header: { key: 'header', name: '头部' },
  },
})
