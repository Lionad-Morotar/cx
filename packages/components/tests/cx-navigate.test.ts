import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxBasics } from '../src/index'
import { CxNavigateKey } from '@lionad/cx-vue'

/**
 * cx-navigate 导航物料测试。
 * 行为契约：push/replace 委托 useCxNavigate 桥；未注入时 noop 不抛错。
 */
const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

const mountNavigate = (provides: Record<any, any> = {}) =>
  mount(byKey('cx-navigate'), {
    props: { cmpt: { id: 'cx-navigate-test', data: {} } as any },
    global: {
      directives: { cx: { mounted() {} } },
      provide: provides,
    },
  })

describe('cx-navigate 导航物料', () => {
  it('normalize 装配为 headless 物料', () => {
    const cmpt = byKey('cx-navigate')
    expect(cmpt._cx_meta.headless).toBe(true)
    expect(cmpt._cx_meta.key).toBe('cx-navigate')
    expect(typeof (cmpt as any)._cx_install).toBe('function')
  })

  it('push/replace 调用注入的路由实现', () => {
    const push = vi.fn()
    const replace = vi.fn()
    const wrapper = mountNavigate({ [CxNavigateKey]: { push, replace } })
    ;(wrapper.vm as any).push('/x')
    ;(wrapper.vm as any).replace({ path: '/y', query: { id: 1 } })
    expect(push).toHaveBeenCalledWith('/x')
    expect(replace).toHaveBeenCalledWith({ path: '/y', query: { id: 1 } })
  })

  it('未注入时 push/replace 走 noop，不抛错', () => {
    const wrapper = mountNavigate()
    expect(() => (wrapper.vm as any).push('/x')).not.toThrow()
    expect(() => (wrapper.vm as any).replace('/y')).not.toThrow()
  })
})
