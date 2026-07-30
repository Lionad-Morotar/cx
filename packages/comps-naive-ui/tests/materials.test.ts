import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { CxNaiveUi, CxNaiveUiBundle } from '../src/index'

/**
 * naive-ui 物料 smoke：defineCxComponent 契约（_cx_meta + _cx_install + key 前缀唯一）+ 挂载断言。
 * comp 为 cx 运行时节点桩：渲染器实际注入含 id/key/data 的对象，桥接层负责剥离。
 * S1 基座期物料集为 button/input 两件 tracer；随 Slice 增长，S5 冻结为 27 件。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxNaiveUi.find((x: any) => x._cx_meta.key === key)!

describe('naive-ui 物料契约', () => {
  it('bundle 自描述：name 为 naive-ui，materials 与 CxNaiveUi 一致', () => {
    expect(CxNaiveUiBundle.name).toBe('naive-ui')
    expect(CxNaiveUiBundle.materials).toHaveLength(CxNaiveUi.length)
  })

  it('六类 27 件冻结：物料总数增删须显式解冻本断言', () => {
    expect(CxNaiveUi).toHaveLength(27)
  })

  it('每个物料带 _cx_meta + _cx_install，key 唯一且匹配 cx-naive-ui- 前缀', () => {
    const keys = new Set<string>()
    for (const m of CxNaiveUi as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
      expect(m._cx_meta.key).toMatch(/^cx-naive-ui-[a-z0-9-]+$/)
      keys.add(m._cx_meta.key)
    }
    expect(keys.size).toBe(CxNaiveUi.length)
  })
})

describe('naive-ui 物料挂载 smoke', () => {
  it('cx-naive-ui-button 渲染 label 文本（default slot 注入）', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-button'), { label: '提交' })
    expect(wrapper.find('.n-button').exists()).toBe(true)
    expect(wrapper.text()).toContain('提交')
  })

  it('cx-naive-ui-button type 配置到达 NButton prop', () => {
    // naive css-render BEM 修饰命名经 S1 tracer 冻结：类型 n-button--<type>-type、
    // 尺寸 n-button--<size>-type（naive 的尺寸修饰与类型共享 -type 后缀，命名反直觉但实测如此）、
    // 禁用 n-button--disabled
    const wrapper = mountMaterial(byKey('cx-naive-ui-button'), { label: 'ok', type: 'success' })
    expect(wrapper.find('.n-button.n-button--success-type').exists()).toBe(true)
  })

  it('cx-naive-ui-button disabled 配置生效', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-button'), { label: 'ok', disabled: true })
    expect(wrapper.find('.n-button.n-button--disabled').exists()).toBe(true)
  })

  it('cx-styles 贯通：class 落到 naive-ui 根元素', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-button'), {
      label: 'ok',
      class: 'custom-cls',
    })
    expect(wrapper.find('.n-button.custom-cls').exists()).toBe(true)
  })

  it('内部键不落 DOM（comp 对象 / data-* 编辑标记）', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-button'), {
      label: 'ok',
      'data-editor-mark': '1',
    })
    expect(wrapper.html()).not.toContain('object Object')
    expect(wrapper.html()).not.toContain('data-editor-mark')
  })

  it('cx-naive-ui-input value 注入到达内部 input DOM', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-input'), { value: 'hello' })
    await nextTick()
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('hello')
  })

  it('cx-naive-ui-input placeholder 透传', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-input'), { placeholder: '请输入内容' })
    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入内容')
  })
})
