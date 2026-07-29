import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { CxElementPlus } from '../src/index'
import { createEpTriggerRegistry, EP_STREAM_TRIGGERS, mainArrayOf } from '../src/stream-triggers'

/**
 * S4 表格物料：JSON columns 驱动 el-table-column、行渲染、空态；
 * 流式增量注册表（R1.5.3，key 取自 _cx_meta.key）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxElementPlus.find((x: any) => x._cx_meta.key === key)!

const TABLE_KEY = byKey('cx-element-plus-table')._cx_meta.key

const mountTable = (props: Record<string, any>) =>
  mount(byKey('cx-element-plus-table') as any, {
    props: { comp: fakeComp('cx-element-plus-table'), ...props },
    attachTo: document.body,
  })

describe('cx-element-plus-table 渲染', () => {
  it('columns JSON 驱动表头', async () => {
    const wrapper = mountTable({
      columns: [
        { key: 'name', label: '名称' },
        { key: 'role', label: '角色' },
      ],
      data: [],
    })
    // ElTableColumn 注册进表格 store 后需两轮 tick 才渲染表头（与 select 选项同源的子组件注册时序）
    await nextTick()
    await nextTick()
    const headers = wrapper.findAll('th').map((th) => th.text())
    expect(headers).toContain('名称')
    expect(headers).toContain('角色')
  })

  it('行数据按列 key 渲染单元格', async () => {
    const wrapper = mountTable({
      columns: [{ key: 'name', label: '名称' }],
      data: [{ name: 'Alice' }, { name: 'Bob' }],
    })
    await nextTick()
    await nextTick()
    const cells = wrapper.findAll('td').map((td) => td.text())
    expect(cells).toContain('Alice')
    expect(cells).toContain('Bob')
  })

  it('空 data 渲染 EP 内置空态', async () => {
    const wrapper = mountTable({ columns: [{ key: 'name', label: '名称' }], data: [] })
    await nextTick()
    expect(wrapper.find('.el-table__empty-block').exists()).toBe(true)
  })

  it('width 配置落到列样式', async () => {
    const wrapper = mountTable({
      columns: [{ key: 'name', label: '名称', width: 120 }],
      data: [],
    })
    await nextTick()
    await nextTick()
    // EP 列宽承载于 colgroup > col[width]（非 th 内联样式）
    expect(wrapper.find('colgroup col').attributes('width')).toBe('120')
  })

  it('data 缺席容错（不崩、按空表渲染）', () => {
    const wrapper = mountTable({ columns: [{ key: 'name', label: '名称' }] })
    expect(wrapper.find('.el-table').exists()).toBe(true)
  })
})

describe('流式增量预设', () => {
  it('table 注册进 trigger registry（key 取自 _cx_meta.key）', () => {
    const registry = createEpTriggerRegistry()
    expect(registry.has(TABLE_KEY)).toBe(true)
    expect(registry.size).toBe(EP_STREAM_TRIGGERS.length)
  })

  it('trigger config 主数组为 data，附扫描列定义路径', () => {
    const config = EP_STREAM_TRIGGERS.find((c) => c.key === TABLE_KEY)
    expect(config).toBeTruthy()
    expect(config!.arrayKey).toBe('data')
    expect(config!.extraScanPaths).toEqual([['data', 'columns', '*']])
  })

  it('mainArrayOf 取节点主数组，非注册 key 返回 null', () => {
    const rows = [{ name: 'Alice' }]
    expect(mainArrayOf({ key: TABLE_KEY, data: { data: rows } })).toBe(rows)
    expect(mainArrayOf({ key: 'cx-element-plus-button', data: { data: rows } })).toBeNull()
    expect(mainArrayOf({ key: TABLE_KEY, data: {} })).toBeNull()
  })
})
