// el-plus @element-plus/components/button 占位实现
// Why: cx-calendar 用 #header slot 覆盖了 calendar 的整个 header，
// 按钮组 fallback 永不渲染。此处仅满足 import 与类型，不追求视觉/交互保真。
import { defineComponent } from 'vue'

export const ElButton = defineComponent({
  name: 'ElButton',
  props: {
    size: { type: String, default: '' },
  },
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

export const ElButtonGroup = defineComponent({
  name: 'ElButtonGroup',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})
