import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxBasics } from '../src/index'
import { CxToastKey } from '@lionad/cx-vue'

/**
 * cx-toast 反馈物料测试。
 * 行为契约：show 委托 useCxToast 桥；桥未注入时退化为 noop（不抛错）。
 */
const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

const mountToast = (provides: Record<any, any> = {}) =>
  mount(byKey('cx-toast'), {
    props: { cmpt: { id: 'cx-toast-test', data: {} } as any },
    global: {
      directives: { cx: { mounted() {} } },
      provide: provides,
    },
  })

describe('cx-toast 反馈物料', () => {
  it('normalize 装配为 headless 物料', () => {
    const cmpt = byKey('cx-toast')
    expect(cmpt._cx_meta.headless).toBe(true)
    expect(cmpt._cx_meta.key).toBe('cx-toast')
    expect(typeof (cmpt as any)._cx_install).toBe('function')
  })

  it('show 调用注入的 toast 实现', () => {
    const show = vi.fn()
    const wrapper = mountToast({ [CxToastKey]: { show } })
    ;(wrapper.vm as any).show({ title: '成功', color: 'success' })
    expect(show).toHaveBeenCalledWith({ title: '成功', color: 'success' })
  })

  it('未注入时 show 走 noop，不抛错', () => {
    const wrapper = mountToast()
    expect(() => (wrapper.vm as any).show({ title: 'x' })).not.toThrow()
  })
})
