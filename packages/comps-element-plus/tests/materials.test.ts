import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxElementPlus, CxElementPlusBundle } from '../src/index'

/**
 * EP 物料 smoke：defineCxComponent 契约（_cx_meta + _cx_install + key 前缀唯一）+ 挂载断言。
 * comp 为 cx 运行时节点桩：渲染器实际注入含 id/key/data 的对象，桥接层负责剥离。
 * S1 基座期物料集为 button/alert 两件 tracer；随 Slice 增长，S5 冻结为 27 件。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxElementPlus.find((x: any) => x._cx_meta.key === key)!

describe('EP 物料契约', () => {
  it('bundle 自描述：name 为 element-plus，materials 与 CxElementPlus 一致', () => {
    expect(CxElementPlusBundle.name).toBe('element-plus')
    expect(CxElementPlusBundle.materials).toHaveLength(CxElementPlus.length)
  })

  it('每个物料带 _cx_meta + _cx_install，key 唯一且匹配 cx-element-plus- 前缀', () => {
    const keys = new Set<string>()
    for (const m of CxElementPlus as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
      expect(m._cx_meta.key).toMatch(/^cx-element-plus-[a-z0-9-]+$/)
      keys.add(m._cx_meta.key)
    }
    expect(keys.size).toBe(CxElementPlus.length)
  })
})

describe('EP 物料挂载 smoke', () => {
  it('cx-element-plus-button 渲染 label 文本', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-button'), { label: '提交' })
    expect(wrapper.find('.el-button').exists()).toBe(true)
    expect(wrapper.text()).toContain('提交')
  })

  it('cx-element-plus-button type 配置到达 EP prop', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-button'), { label: 'ok', type: 'success' })
    expect(wrapper.find('.el-button--success').exists()).toBe(true)
  })

  it('cx-element-plus-button disabled 配置生效', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-button'), { label: 'ok', disabled: true })
    expect(wrapper.find('.el-button.is-disabled').exists()).toBe(true)
  })

  it('cx-styles 贯通：class 落到 EP 根元素', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-button'), {
      label: 'ok',
      class: 'custom-cls',
    })
    expect(wrapper.find('.el-button.custom-cls').exists()).toBe(true)
  })

  it('内部键不落 DOM（comp 对象 / data-* 编辑标记）', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-button'), {
      label: 'ok',
      'data-editor-mark': '1',
    })
    expect(wrapper.html()).not.toContain('object Object')
    expect(wrapper.html()).not.toContain('data-editor-mark')
  })

  it('cx-element-plus-alert 渲染 title 与 type', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-alert'), {
      title: '操作成功',
      type: 'success',
    })
    expect(wrapper.find('.el-alert--success').exists()).toBe(true)
    expect(wrapper.text()).toContain('操作成功')
  })

  it('cx-element-plus-alert closable=false 移除关闭按钮', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-alert'), {
      title: '提示',
      closable: false,
    })
    expect(wrapper.find('.el-alert__close-btn').exists()).toBe(false)
  })
})
