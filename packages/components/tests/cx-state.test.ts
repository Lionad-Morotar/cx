import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'

import { CxBasics } from '../src/index'

/**
 * cx-state 状态桥物料测试。
 * 行为契约：props.value 同步到 comp.data.value（immediate + 变更），
 * 供其他物料经 _cx_data_config 绑定。
 */
const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

const mountState = (props: Record<string, any>) =>
  mount(byKey('cx-state'), {
    props,
    global: { directives: { cx: { mounted() {} } } },
  })

describe('cx-state 状态桥物料', () => {
  it('defineCxComponent 装配为 headless 物料', () => {
    const comp = byKey('cx-state')
    expect(comp._cx_meta.headless).toBe(true)
    expect(comp._cx_meta.key).toBe('cx-state')
    expect(typeof (comp as any)._cx_install).toBe('function')
  })

  it('初始 value 立即同步到 comp.data.value', () => {
    const comp = { id: 'cx-state-test', data: reactive({}) } as any
    mountState({ comp, value: 'a' })
    expect(comp.data.value).toBe('a')
  })

  it('value 变化同步到 comp.data.value', async () => {
    const comp = { id: 'cx-state-test', data: reactive({}) } as any
    const wrapper = mountState({ comp, value: 1 })
    expect(comp.data.value).toBe(1)
    await wrapper.setProps({ value: 2 })
    expect(comp.data.value).toBe(2)
  })

  it('未传 value 时 comp.data.value 不被显式覆盖', () => {
    const comp = { id: 'cx-state-test', data: reactive({ existing: 'x' }) } as any
    mountState({ comp })
    expect(comp.data.existing).toBe('x')
  })
})
