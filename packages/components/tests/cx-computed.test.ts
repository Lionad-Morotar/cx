import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'

import { CxBasics } from '../src/index'
import { safeEval } from '../src/basic/src/computed-eval'

/**
 * cx-computed 派生物料 + safeEval 受限求值器测试。
 * 安全契约：无 eval/Function，标识符仅查 ctx，函数不会被调用，非法语法抛错。
 */
const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

describe('safeEval 受限表达式求值器', () => {
  it('布尔组合 ||', () => {
    expect(safeEval('a || b', { a: false, b: true })).toBe(true)
    expect(safeEval('a || b', { a: false, b: false })).toBe(false)
  })
  it('布尔组合 &&', () => {
    expect(safeEval('a && b', { a: true, b: true })).toBe(true)
    expect(safeEval('a && b', { a: true, b: false })).toBe(false)
  })
  it('非 !', () => {
    expect(safeEval('!a', { a: false })).toBe(true)
    expect(safeEval('!a', { a: true })).toBe(false)
  })
  it('比较运算', () => {
    expect(safeEval('a > 1', { a: 2 })).toBe(true)
    expect(safeEval('a >= 2', { a: 2 })).toBe(true)
    expect(safeEval('a == "x"', { a: 'x' })).toBe(true)
    expect(safeEval('a != null', { a: 0 })).toBe(true)
  })
  it('括号分组', () => {
    expect(safeEval('(a || b) && c', { a: true, b: false, c: true })).toBe(true)
  })
  it('字面量 true/false/null/数字/字符串', () => {
    expect(safeEval('true')).toBe(true)
    expect(safeEval('null')).toBeNull()
    expect(safeEval('42')).toBe(42)
    expect(safeEval('"hi"')).toBe('hi')
  })
  it('注入尝试：函数标识符不会被调用', () => {
    const fn = vi.fn()
    const r = safeEval('fn', { fn })
    expect(r).toBe(fn)
    expect(fn).not.toHaveBeenCalled()
  })
  it('注入尝试：调用语法/属性访问抛错', () => {
    expect(() => safeEval('eval("x")', {})).toThrow()
    expect(() => safeEval('alert(1)', {})).toThrow()
    expect(() => safeEval('a.b', { a: {} })).toThrow()
  })
})

describe('cx-computed 派生物料', () => {
  it('normalize 装配为 headless 物料', () => {
    const comp = byKey('cx-computed')
    expect(comp._cx_meta.headless).toBe(true)
    expect(comp._cx_meta.key).toBe('cx-computed')
    expect(typeof (comp as any)._cx_install).toBe('function')
  })

  it('expr + ctx 求值写入 comp.data.value', () => {
    const comp = { id: 'cx-computed-test', data: reactive({}) } as any
    mount(byKey('cx-computed'), {
      props: { comp, expr: 'a || b', ctx: { a: false, b: true } },
      global: { directives: { cx: { mounted() {} } } },
    })
    expect(comp.data.value).toBe(true)
  })

  it('ctx 变化重新求值', async () => {
    const comp = { id: 'cx-computed-test', data: reactive({}) } as any
    const wrapper = mount(byKey('cx-computed'), {
      props: { comp, expr: 'a && b', ctx: { a: true, b: false } },
      global: { directives: { cx: { mounted() {} } } },
    })
    expect(comp.data.value).toBe(false)
    await wrapper.setProps({ ctx: { a: true, b: true } })
    expect(comp.data.value).toBe(true)
  })

  it('非法表达式回退 undefined（不抛错）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const comp = { id: 'cx-computed-test', data: reactive({}) } as any
    mount(byKey('cx-computed'), {
      props: { comp, expr: 'a.b.c', ctx: {} },
      global: { directives: { cx: { mounted() {} } } },
    })
    expect(comp.data.value).toBeUndefined()
    warn.mockRestore()
  })
})
