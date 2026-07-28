import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxBasics } from '../src/index'

/**
 * 物料 smoke：每个物料的组件能挂载且 props 归一化不炸。
 * v-cx 指令由宿主编辑器安装，测试中注册 no-op 版避免警告。
 * 注意：defineCxComponent 的返回即组件本体（_cx_meta 挂载其上）。
 */
const mountWithCx = (
  component: any,
  props: Record<string, any> = {},
  opts: { slots?: Record<string, any> } = {},
) =>
  mount(component, {
    props,
    slots: opts.slots,
    global: {
      directives: { cx: { mounted() {} } },
    },
  })

const byKey = (key: string) => CxBasics.find((x: any) => x._cx_meta.key === key)!

describe('基础物料 smoke', () => {
  it('cx-text 渲染内容与元素类型', () => {
    const comp = byKey('cx-text')
    const wrapper = mountWithCx(comp, { content: '你好 cx', type: 'p' })
    expect(wrapper.text()).toContain('你好 cx')
    expect(wrapper.element.tagName.toLowerCase()).toBe('p')
  })

  it('cx-text truncate 类名随 prop 切换', () => {
    const comp = byKey('cx-text')
    const wrapper = mountWithCx(comp, { content: 'x', type: 'p', truncate: true })
    expect(wrapper.classes().join(' ')).toContain('is-truncate')
  })

  it('cx-header 渲染标题层级', () => {
    const comp = byKey('cx-header')
    const wrapper = mountWithCx(comp, { content: '标题' })
    expect(wrapper.text()).toContain('标题')
  })

  it('cx-h1~cx-h5 均可挂载', () => {
    for (const key of ['cx-h1', 'cx-h2', 'cx-h3', 'cx-h4', 'cx-h5']) {
      const comp = byKey(key)
      const wrapper = mountWithCx(comp, { content: 't' })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('cx-logic for 模式按次数重复渲染 slot', () => {
    const comp = byKey('cx-logic')
    const wrapper = mountWithCx(
      comp,
      { type: 'for', value: 3 },
      {
        slots: { default: '<span class="item">x</span>' },
      },
    )
    expect(wrapper.findAll('.item')).toHaveLength(3)
  })

  it('物料 meta 全部经 defineCxComponent 装配（_cx_meta + install）', () => {
    for (const meta of CxBasics) {
      expect(meta._cx_meta).toBeTruthy()
      expect(typeof (meta as any)._cx_install).toBe('function')
    }
  })
})
