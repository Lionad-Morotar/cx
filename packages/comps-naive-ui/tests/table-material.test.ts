import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { CxNaiveUi } from '../src/index'
import { createNaiveUiTriggerRegistry, mainArrayOf } from '../src/stream-triggers'

/**
 * data-table：列定义驱动（label→title 映射）+ 行渲染 + 空态 + 流式增量注册表。
 * 表头/行渲染统一双 nextTick（naive 表格内部经 vueuc 测量布局，与 EP 子组件注册时序同族）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const dataTable = () => CxNaiveUi.find((x: any) => x._cx_meta.key === 'cx-naive-ui-data-table')!

const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('data-table 列定义与行渲染', () => {
  it('columns label 经映射渲染为表头 title 文本（双 tick）', async () => {
    const wrapper = mountMaterial(dataTable(), {
      columns: [{ key: 'name', label: '名称' }],
      data: [],
    })
    await settle()
    const th = wrapper.find('th')
    expect(th.exists()).toBe(true)
    expect(wrapper.text()).toContain('名称')
  })

  it('行值按列 key 取值渲染为单元格文本（双 tick）', async () => {
    const wrapper = mountMaterial(dataTable(), {
      columns: [{ key: 'name', label: '名称' }],
      data: [{ name: 'Alice' }, { name: 'Bob' }],
    })
    await settle()
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('width 字段到达列宽载体（双 tick，载体形态探测冻结）', async () => {
    const wrapper = mountMaterial(dataTable(), {
      columns: [{ key: 'name', label: '名称', width: 180 }],
      data: [],
    })
    await settle()
    // EP 先例：width 承载于 colgroup>col[width] 而非 th 内联（EP 报告 Bug①），naive 经 vueuc
    // 布局同走 colgroup——以 html 全文含宽度声明为证据，避免绑定具体载体实现
    expect(wrapper.html()).toMatch(/180/)
  })

  it('空 data 渲染 naive 内置空态（双 tick）', async () => {
    const wrapper = mountMaterial(dataTable(), {
      columns: [{ key: 'name', label: '名称' }],
      data: [],
    })
    await settle()
    const html = wrapper.html()
    expect(html.includes('n-empty') || html.includes('n-data-table-empty')).toBe(true)
  })
})

describe('data-table 流式增量注册表', () => {
  it('createNaiveUiTriggerRegistry 命中 table meta key', () => {
    const registry = createNaiveUiTriggerRegistry()
    const trigger = registry.get('cx-naive-ui-data-table')
    expect(trigger).toBeTruthy()
  })

  it('trigger scanPaths 覆盖行主路径与列定义次路径（语义断言，非仅命中）', () => {
    // 注册命中无法保证扫描语义正确（arrayKey 写错仍命中）；cx-array-trigger.ts:40
    // mainPath = ['data', arrayKey, '*']，此处断言主路径与 columns 次路径齐备
    const registry = createNaiveUiTriggerRegistry()
    const trigger = registry.get('cx-naive-ui-data-table') as { scanPaths: unknown[][] }
    expect(trigger.scanPaths).toContainEqual(['data', 'data', '*'])
    expect(trigger.scanPaths).toContainEqual(['data', 'columns', '*'])
  })

  it('mainArrayOf 取 data 主数组，非增长型 key 返回 null', () => {
    expect(mainArrayOf({ key: 'cx-naive-ui-data-table', data: { data: [1, 2] } })).toEqual([1, 2])
    expect(mainArrayOf({ key: 'cx-naive-ui-button', data: { data: [1] } })).toBeNull()
    expect(mainArrayOf({ key: 'cx-naive-ui-data-table' })).toBeNull()
  })
})
