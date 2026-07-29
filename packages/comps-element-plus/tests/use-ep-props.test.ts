import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { useEpProps } from '../src/shared/use-ep-props'

/**
 * cx 渲染器经 attrs 灌入 data + 运行时节点 + 编辑器标记（render-component-with-bindings），
 * 桥接层职责：剥离 cx 内部键、保留 EP 可消费的 props / class / 监听器。
 */
describe('useEpProps cx attrs 桥接', () => {
  it('剥离渲染器与编辑器内部键（comp / data-* / 下划线前缀）', () => {
    const props = useEpProps({
      comp: { id: 'x', key: 'cx-element-plus-button', data: {}, components: {} },
      'data-editor-mark': '1',
      _internal: '1',
      placeholder: '保留我',
    })
    expect(props.value).toEqual({ placeholder: '保留我' })
  })

  it('保留 class 与 style：cx-styles 绑定经此贯通到 EP 根元素', () => {
    const props = useEpProps({ class: 'custom-cls', style: 'color: red;', type: 'primary' })
    expect(props.value).toEqual({ class: 'custom-cls', style: 'color: red;', type: 'primary' })
  })

  it('保留 on* 监听器：原生事件上行链（nativeEvents ∩ _cx_events）经此到达 EP 组件', () => {
    const onClick = () => {}
    const onInput = () => {}
    const props = useEpProps({ onClick, onInput, disabled: true })
    expect(props.value.onClick).toBe(onClick)
    expect(props.value.onInput).toBe(onInput)
    expect(props.value.disabled).toBe(true)
  })

  it('跟随 attrs 响应式变化', () => {
    const attrs = reactive<Record<string, unknown>>({ placeholder: 'a' })
    const props = useEpProps(attrs)
    expect(props.value.placeholder).toBe('a')
    attrs.placeholder = 'b'
    expect(props.value.placeholder).toBe('b')
  })
})
