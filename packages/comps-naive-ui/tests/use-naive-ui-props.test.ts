import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { useNaiveUiProps } from '../src/shared/use-naive-ui-props'

/**
 * cx 渲染器经 attrs 灌入 data + 运行时节点 + 编辑器标记（render-component-with-bindings），
 * 桥接层职责：剥离 cx 内部键、保留 naive-ui 可消费的 props / class / on* 监听器。
 */
describe('useNaiveUiProps cx attrs 桥接', () => {
  it('剥离渲染器与编辑器内部键（comp / data-* / 下划线前缀）', () => {
    const props = useNaiveUiProps({
      comp: { id: 'x', key: 'cx-naive-ui-button', data: {}, components: {} },
      'data-editor-mark': '1',
      _internal: '1',
      placeholder: '保留我',
    })
    expect(props.value).toEqual({ placeholder: '保留我' })
  })

  it('保留 class 与 style：cx-styles 绑定经此贯通到 naive-ui 根元素', () => {
    const props = useNaiveUiProps({ class: 'custom-cls', style: 'color: red;', type: 'primary' })
    expect(props.value).toEqual({ class: 'custom-cls', style: 'color: red;', type: 'primary' })
  })

  it('保留 on* 监听器：原生冒泡通道与 update:value 桥接通道均以 on* 键为接缝', () => {
    const onClick = () => {}
    const onInput = () => {}
    const onChange = () => {}
    const props = useNaiveUiProps({ onClick, onInput, onChange, disabled: true })
    expect(props.value.onClick).toBe(onClick)
    expect(props.value.onInput).toBe(onInput)
    expect(props.value.onChange).toBe(onChange)
    expect(props.value.disabled).toBe(true)
  })

  it('跟随 attrs 响应式变化', () => {
    const attrs = reactive<Record<string, unknown>>({ placeholder: 'a' })
    const props = useNaiveUiProps(attrs)
    expect(props.value.placeholder).toBe('a')
    attrs.placeholder = 'b'
    expect(props.value.placeholder).toBe('b')
  })
})
