import { describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'

import { useNaiveChangeBridge } from '../src/shared/use-naive-change-bridge'

/**
 * 自定义控件族变更上行桥接：剥离 onChange/onInput（防废弃 prop 双发与死监听器），
 * emitChange 把 update:value 载荷递交 attrs.onChange。
 */
describe('useNaiveChangeBridge', () => {
  it('forwarded 剥离 onChange/onInput，保留其余配置键', () => {
    const onChange = vi.fn()
    const onInput = vi.fn()
    const naiveProps = computed(() => ({ onChange, onInput, value: true, round: false }))
    const { forwarded } = useNaiveChangeBridge(naiveProps)
    expect(forwarded.value).toEqual({ value: true, round: false })
  })

  it('emitChange 调用 attrs.onChange 并递交载荷', () => {
    const onChange = vi.fn()
    const naiveProps = computed(() => ({ onChange }))
    const { emitChange } = useNaiveChangeBridge(naiveProps)
    emitChange('a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('attrs.onChange 缺席时 emitChange 静默不抛', () => {
    const naiveProps = computed<Record<string, unknown>>(() => ({ value: 1 }))
    const { emitChange } = useNaiveChangeBridge(naiveProps)
    expect(() => emitChange('x')).not.toThrow()
  })
})
