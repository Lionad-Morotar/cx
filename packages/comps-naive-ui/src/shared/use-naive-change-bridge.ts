import { computed } from 'vue'

import type { ComputedRef } from 'vue'

/**
 * 自定义控件族（无 onChange 函数 prop 或仅废弃 onChange 的控件）的变更上行桥接。
 *
 * naive-ui 约定回调即函数型 props，但各控件覆盖不一：NInput/NInputNumber/NSelect 声明并调用
 * onChange 函数 prop（v-bind 直达即可，属透传族，不走本桥）；NSwitch 的 onChange 已废弃
 * （保留原生消费会与桥接双发）、NRadioGroup/NCheckboxGroup/NRate/NSlider 根本无 onChange prop
 * （v-bind 的 onChange 会 fallthrough 成根 DOM 死监听器）、NDatePicker 的 onChange 同样废弃
 * （内部仍调用，不剥离会与桥接双发）。这三族统一由 wrapper 显式桥接：
 *
 * - forwarded：v-bind 载荷剥离 onChange/onInput（防废弃 prop 双发与死监听器）；
 * - emitChange(v)：`@update:value` 触发时调用 attrs.onChange?.(v)，把 naive 的 update:value
 *   接入 cx 原生事件通道（nativeEvents 不含 update:value，渲染器只编译出 onChange/onInput）。
 *
 * 载荷形态由各 wrapper 决定：值控件传新值；date-picker 传 formattedValue 字符串。
 */
export function useNaiveChangeBridge(
  naiveProps: ComputedRef<Record<string, unknown>>,
): {
  forwarded: ComputedRef<Record<string, unknown>>
  emitChange: (payload: unknown) => void
} {
  const forwarded = computed(() => {
    const { onChange: _change, onInput: _input, ...rest } = naiveProps.value
    return rest
  })
  const emitChange = (payload: unknown): void => {
    const cb = naiveProps.value.onChange
    if (typeof cb === 'function') {
      ;(cb as (v: unknown) => void)(payload)
    }
  }
  return { forwarded, emitChange }
}
