import { describe, expect, it } from 'vitest'

import {
  createIncrementalExtractor,
  createTriggerRegistry,
} from '../src/core/incremental'
import { shareStructure } from '../src/core/structural-sharing'
import { matchCxTrigger } from '../src/cx'

import type { IncrementalTrigger } from '../src/core/incremental'
import type { CxSpec, CxStreamNode } from '../src/cx'

/**
 * 结构共享测试：shareStructure 单元行为 + 提取器帧间引用稳定性。
 * 核心契约：帧间同值子树复用上帧引用（渲染器按引用跳过 patch），
 * 变化子树整体采用新引用（父级需要感知内容变化）。
 */

describe('shareStructure', () => {
  it('原始值与引用恒等：直接复用', () => {
    expect(shareStructure(1, 1)).toBe(1)
    expect(shareStructure('a', 'b')).toBe('b')
    expect(shareStructure(null, { a: 1 })).toEqual({ a: 1 })
    const same = { a: [1] }
    expect(shareStructure(same, same)).toBe(same)
  })

  it('全同值对象树：返回 prev 引用', () => {
    const prev = { a: { b: [1, 2] }, c: 'x' }
    const next = { a: { b: [1, 2] }, c: 'x' }
    expect(shareStructure(prev, next)).toBe(prev)
  })

  it('部分字段变化：新对象但未变子树引用保持', () => {
    const stable = { list: [1, 2] }
    const prev = { stable, changed: { v: 1 } }
    const next = { stable: { list: [1, 2] }, changed: { v: 2 } }
    const out = shareStructure(prev, next)
    expect(out).not.toBe(prev)
    expect(out.stable).toBe(prev.stable)
    expect(out.stable.list).toBe(prev.stable.list)
    expect(out.changed).not.toBe(prev.changed)
    expect(out.changed.v).toBe(2)
  })

  it('数组等长元素变化：新数组但未变元素引用保持', () => {
    const item1 = { id: 1 }
    const prev = [item1, { id: 2 }]
    const next = [{ id: 1 }, { id: 3 }]
    const out = shareStructure(prev, next)
    expect(out).not.toBe(prev)
    expect(out[0]).toBe(item1)
    expect(out[1]).not.toBe(prev[1])
  })

  it('数组变长或键集变化：整体采用 next', () => {
    const longer = [1, 2, 3]
    expect(shareStructure([1, 2], longer)).toBe(longer)
    const moreKeys = { a: 1, b: 2 }
    expect(shareStructure<Record<string, number>>({ a: 1 }, moreKeys)).toBe(moreKeys)
  })

  it('容器类型不一致（对象 vs 数组）：采用 next', () => {
    const nextArr = [1]
    expect(shareStructure({ 0: 1 } as unknown as unknown[], nextArr)).toBe(nextArr)
  })
})

/** 表格 trigger：buildPartial 每帧显式展开新引用（贴近真实 trigger 写法） */
const tableTrigger: IncrementalTrigger<CxSpec> = {
  scanPaths: [
    ['data', 'columns', '*'],
    ['data', 'rows', '*'],
  ],
  buildPartial(spec) {
    if (Array.isArray(spec)) return null
    const data = (spec.data ?? {}) as Record<string, unknown>
    const columns = Array.isArray(data.columns) ? data.columns : []
    if (columns.length === 0) return null
    return {
      ...spec,
      data: {
        ...data,
        columns: [...columns],
        rows: Array.isArray(data.rows) ? [...data.rows] : [],
      },
    }
  },
}

function createTableExtractor() {
  const registry = createTriggerRegistry<CxSpec>()
  registry.register('cx-demo-table', tableTrigger)
  return createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
}

const frame = (rows: string) =>
  `{"id":"t1","key":"cx-demo-table","data":{"columns":[{"key":"name","label":"名称"}],"rows":[${rows}]}}`
const row1 = `{"name":"磨床"}`
const row2 = `{"name":"充电器"}`

describe('提取器帧间结构共享', () => {
  it('未变子树跨帧引用稳定，增长子树采用新引用', () => {
    const ex = createTableExtractor()
    const f1 = ex.next(frame(row1)) as CxStreamNode
    const f2 = ex.next(frame(`${row1},${row2}`)) as CxStreamNode
    const d1 = f1.data as Record<string, unknown>
    const d2 = f2.data as Record<string, unknown>
    // columns 内容未变：即使 trigger 每帧展开新数组，深度同值比较仍收敛回上帧引用
    expect(d2.columns).toBe(d1.columns)
    // rows 增长（长度变化）：整体新引用，父级必须感知
    expect(d2.rows).not.toBe(d1.rows)
    expect(d2.rows).toHaveLength(2)
    expect(f2).not.toBe(f1)
  })

  it('同内容帧：整树返回上帧引用', () => {
    const ex = createTableExtractor()
    const f1 = ex.next(frame(row1))
    const f2 = ex.next(frame(row1))
    expect(f2).toBe(f1)
  })

  it('reset 后缓存清空，重新出帧不与旧树共享', () => {
    const ex = createTableExtractor()
    const f1 = ex.next(frame(row1))
    ex.reset()
    const f2 = ex.next(frame(row1)) as CxStreamNode
    expect(f2).not.toBe(f1)
    expect(f2).toEqual(f1)
  })
})
