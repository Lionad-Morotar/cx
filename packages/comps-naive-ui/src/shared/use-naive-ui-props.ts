import { computed } from 'vue'

import type { ComputedRef } from 'vue'

/**
 * 把 cx 渲染器灌入的 attrs 提纯为可直接 v-bind 给 Naive UI 组件的 props。
 *
 * cx 的 render-component-with-bindings 以 h() 把 data（已剔 _cx_* 元字段）、运行时节点
 * `comp`、class/style 与 data-* 编辑标记一并作为 attrs 灌入物料包装层。透传给 naive-ui 前需
 * 剥离不属于其 props 的 cx 内部键：`comp`（运行时节点，落到 DOM 会变成 "[object Object]" 属性）、
 * `data-*`（编辑器选区标记）、下划线前缀键（编辑器专用约定）。
 *
 * class/style 与 on* 监听器原样保留：前者承载 cx-styles 的 margin/padding/border 绑定（经 Vue
 * 的 fallthrough 落到组件根元素）；后者是变更上行链的唯一载体——naive-ui 的双向约定为
 * `value` + `update:value`（非 modelValue），且 cx 原生事件表（nativeEvents，36 个纯 DOM 事件）
 * 不含 `update:value`。naive-ui 约定回调即函数型 props（onInput/onChange/onUpdateValue 声明为
 * `[Function, Array]` prop 而非 Vue emits）：文本输入族控件（n-input / n-input-number）声明
 * onInput/onChange 函数 props 并于内部调用（逐键 / 提交态），v-bind 的监听器直达为这些 props，
 * 包装层无需桥接；自定义控件族（select / switch 等）无 onChange 函数 prop（switch 的 onChange
 * 已废弃），由各 wrapper 剥离 on* 后显式桥接 `@update:value → attrs.onChange?.()` 防双发。
 * 两条通道都以本桥保留的 on* 键为接缝。
 */
export function useNaiveUiProps<T extends object = Record<string, unknown>>(
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
