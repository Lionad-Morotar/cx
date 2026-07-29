import { computed } from 'vue'

import type { ComputedRef } from 'vue'

/**
 * 把 cx 渲染器灌入的 attrs 提纯为可直接 v-bind 给 Element Plus 组件的 props。
 *
 * cx 的 render-component-with-bindings 以 h() 把 data（已剔 _cx_* 元字段）、运行时节点
 * `comp`、class/style 与 data-* 编辑标记一并作为 attrs 灌入物料包装层。透传给 EP 前需剥离
 * 不属于 EP props 的 cx 内部键：`comp`（运行时节点，落到 DOM 会变成 "[object Object]" 属性）、
 * `data-*`（编辑器选区标记）、下划线前缀键（编辑器专用、避让 EP 同名 prop 的约定）。
 * class/style 与 on* 监听器原样保留：前者承载 cx-styles 的 margin/padding/border 绑定
 * （经 Vue 的 class 合并落到 EP 组件根元素），后者是原生事件上行链的载体——渲染器把
 * nativeEvents ∩ _cx_events 编译为 compEvents 监听器随 attrs 灌入，v-bind 后由 EP 组件
 * 声明的 emits（如 ElInput 的 input/change）或根 DOM 事件消费。
 *
 * Why 无 id 回退：vtu 桥接（use-vtu-props）的 id 回退专用于 vtu 的必填 id 约定
 * （ToolUIIdSchema）；EP 组件无必填 id，多此一举反而遮蔽低代码侧的显式配置。
 */
export function useEpProps<T extends object = Record<string, unknown>>(
  attrs: Record<string, unknown>,
): ComputedRef<T> {
  return computed(() => {
    const rest: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'comp' || key.startsWith('data-') || key.startsWith('_')) {
        continue
      }
      rest[key] = value
    }
    return rest as T
  })
}
