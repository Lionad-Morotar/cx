import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'

import { CxBasics } from '../src/index'

/**
 * cx-action 编排枢纽物料测试。
 * 行为契约：exec 调 props.action（合并 args + runtimeArgs）→ 异步执行 →
 * 写 comp.data.{loading,data,error} + emit success/error。
 * v-cx 指令由宿主安装，测试用 no-op。
 */
const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

const makeComp = (data: Record<string, any> = {}) =>
  ({
    id: 'cx-action-test',
    data: reactive({ loading: false, data: null, error: null, ...data }),
  }) as any

const mountAction = (props: Record<string, any>) =>
  mount(byKey('cx-action'), {
    props,
    global: { directives: { cx: { mounted() {} } } },
  })

describe('cx-action 编排枢纽物料', () => {
  it('defineCxComponent 装配为 headless 物料', () => {
    const comp = byKey('cx-action')
    expect(comp._cx_meta).toBeTruthy()
    expect(comp._cx_meta.headless).toBe(true)
    expect(comp._cx_meta.key).toBe('cx-action')
    expect(typeof (comp as any)._cx_install).toBe('function')
  })

  it('exec 调用 props.action（合并 args + runtimeArgs）并 emit success + 写 comp.data', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const comp = makeComp()
    const wrapper = mountAction({ comp, action, args: [1, 2] })

    await (wrapper.vm as any).exec('runtime')
    await flushPromises()

    expect(action).toHaveBeenCalledWith(1, 2, 'runtime')
    expect(wrapper.emitted('success')?.[0]).toEqual(['ok'])
    expect(comp.data.data).toBe('ok')
    expect(comp.data.loading).toBe(false)
    expect(comp.data.error).toBeNull()
  })

  it('exec 期间 comp.data.loading 为 true，完成后回 false', async () => {
    let resolveFn: (v: any) => void = () => {}
    const action = vi.fn().mockReturnValue(new Promise((r) => (resolveFn = r as (v: any) => void)))
    const comp = makeComp()
    const wrapper = mountAction({ comp, action })

    const p = (wrapper.vm as any).exec()
    await flushPromises()
    expect(comp.data.loading).toBe(true)

    resolveFn('done')
    await p
    await flushPromises()
    expect(comp.data.loading).toBe(false)
    expect(comp.data.data).toBe('done')
  })

  it('action 抛错时 emit error + 写 comp.data.error，loading 回 false', async () => {
    const err = new Error('boom')
    const action = vi.fn().mockRejectedValue(err)
    const comp = makeComp()
    const wrapper = mountAction({ comp, action })

    await (wrapper.vm as any).exec()
    await flushPromises()

    expect(wrapper.emitted('error')?.[0]).toEqual([err])
    expect(comp.data.error).toBe(err)
    expect(comp.data.loading).toBe(false)
  })

  it('无 action 时 exec 不抛错，仅切 loading', async () => {
    const comp = makeComp()
    const wrapper = mountAction({ comp })

    await (wrapper.vm as any).exec()
    await flushPromises()

    expect(comp.data.loading).toBe(false)
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
