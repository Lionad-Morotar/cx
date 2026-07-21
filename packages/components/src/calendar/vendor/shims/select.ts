// el-plus @element-plus/components/select 占位实现
// Why: select-controller 仅在 controllerType === 'select' 且未传 #header slot 时渲染，
// cx-calendar 始终传 #header slot，故永不渲染。此处仅满足 import。
import { defineComponent } from 'vue'

const ElSelect = defineComponent({
  name: 'ElSelect',
  props: {
    options: { type: Array, default: () => [] },
    size: { type: String, default: '' },
  },
  setup() {
    return () => null
  },
})

export default ElSelect
