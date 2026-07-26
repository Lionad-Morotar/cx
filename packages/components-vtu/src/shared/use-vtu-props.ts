import { computed } from 'vue'

import type { ComputedRef } from 'vue'
import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 把 cx 渲染器灌入的 attrs 提纯为可直接 v-bind 给 vtu 组件的 props。
 *
 * cx 的 render-component-with-bindings 以 h() 把 data（已剔 _cx_* 元字段）、运行时节点
 * `comp`、class/style 与 data-* 编辑标记一并作为 attrs 灌入物料包装层。透传给 vtu 前需剥离
 * 不属于 vtu props 的 cx 内部键：`comp`（运行时节点，落到 DOM 会变成 "[object Object]" 属性）、
 * `data-*`（编辑器选区标记）、下划线前缀键（编辑器专用、避让 vtu 同名 prop 的约定）。
 * 其余键名与 vtu props 同名，原样透传即被 vtu 的 defineProps 消费。
 *
 * Why id 回退：vtu 组件普遍要求语义化必填 `id`（ToolUIIdSchema）；低代码侧通常不显式配置，
 * 故缺省时回退到 cx 运行时节点的唯一 comp.id，保证 id 恒有值且同页多实例互不冲突。
 */
export function useVtuProps<T extends object>(
  attrs: Record<string, unknown>,
  fallbackId: string,
): ComputedRef<T & { id: string }> {
  return computed(() => {
    const rest: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'comp' || key.startsWith('data-') || key.startsWith('_')) {
        continue
      }
      rest[key] = value
    }
    const comp = attrs.comp as CxComponentRuntime | undefined
    rest.id = (rest.id as string | undefined) || comp?.id || fallbackId
    return rest as T & { id: string }
  })
}
