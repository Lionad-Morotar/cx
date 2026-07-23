import { describe, expect, it } from 'vitest'
import {
  closingBrackets,
  createIncrementalExtractor,
  createTriggerRegistry,
} from '../src/core/incremental'
import { matchCxTrigger } from '../src/cx'

import type { IncrementalTrigger } from '../src/core/incremental'
import type { CxSpec, CxStreamNode } from '../src/cx'

/** cx-demo-table 形状的 trigger（测试与 demo 共用的典型范例） */
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
        // 显式新数组引用，确保渲染端检测到行数变化
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

const tablePrefix = `{"id":"t1","key":"cx-demo-table","data":{"columns":[`
const col1 = `{"key":"name","label":"名称"}`
const col2 = `{"key":"category","label":"类别"}`
const row1 = `{"name":"磨床","category":"电动工具"}`
const row2 = `{"name":"充电器","category":"电池相关"}`

describe('closingBrackets', () => {
  it('对象根路径：按容器类型补混合括号', () => {
    // ['data','columns',0] → 列数组 ] + data 对象 } + 根对象 }
    expect(closingBrackets(['data', 'columns', 0])).toBe(']}}')
  })

  it('数组根路径：根层补 ]', () => {
    // [0,'data','rows',0] → 行数组 ] + data 对象 } + 元素对象 } + 根数组 ]
    expect(closingBrackets([0, 'data', 'rows', 0])).toBe(']}}]')
  })

  it('单层路径', () => {
    expect(closingBrackets(['data'])).toBe('}')
    expect(closingBrackets([0])).toBe(']')
  })
})

describe('createTriggerRegistry', () => {
  it('两个注册表互不污染（工厂隔离）', () => {
    const r1 = createTriggerRegistry()
    const r2 = createTriggerRegistry()
    r1.register('a', { scanPaths: [], buildPartial: () => null })
    expect(r1.has('a')).toBe(true)
    expect(r2.has('a')).toBe(false)
    expect(r1.size).toBe(1)
    expect(r2.size).toBe(0)
  })

  it('unregister', () => {
    const r = createTriggerRegistry()
    r.register('a', { scanPaths: [], buildPartial: () => null })
    expect(r.unregister('a')).toBe(true)
    expect(r.has('a')).toBe(false)
  })
})

describe('createIncrementalExtractor（cx 表格流式）', () => {
  it('只有前缀：无匹配返回 null', () => {
    const ex = createTableExtractor()
    expect(ex.next(tablePrefix)).toBeNull()
  })

  it('第一个 column 完整：部分 Spec 含 1 列 0 行', () => {
    const ex = createTableExtractor()
    const partial = ex.next(`${tablePrefix}${col1}`)
    expect(partial).not.toBeNull()
    const node = partial as CxStreamNode
    expect(node.key).toBe('cx-demo-table')
    expect((node.data!.columns as unknown[]).length).toBe(1)
    expect((node.data!.rows as unknown[]).length).toBe(0)
  })

  it('columns 完整 + rows 逐行增长', () => {
    const ex = createTableExtractor()
    const base = `${tablePrefix}${col1},${col2}],"rows":[`

    const p1 = ex.next(`${base}${row1}`) as CxStreamNode
    expect((p1.data!.columns as unknown[]).length).toBe(2)
    expect((p1.data!.rows as unknown[]).length).toBe(1)

    const p2 = ex.next(`${base}${row1},${row2}`) as CxStreamNode
    expect((p2.data!.rows as unknown[]).length).toBe(2)
  })

  it('每次产出新数组引用（渲染端可检测变化）', () => {
    const ex = createTableExtractor()
    const base = `${tablePrefix}${col1}],"rows":[`
    const p1 = ex.next(`${base}${row1}`) as CxStreamNode
    const p2 = ex.next(`${base}${row1},${row2}`) as CxStreamNode
    expect(p1.data!.rows).not.toBe(p2.data!.rows)
  })

  it('围栏包裹的输入同样工作', () => {
    const ex = createTableExtractor()
    const text = `结果：\n\`\`\`json\n${tablePrefix}${col1},${col2}`
    const partial = ex.next(text) as CxStreamNode
    expect((partial.data!.columns as unknown[]).length).toBe(2)
  })

  it('多代码块：取最后一个未闭合块', () => {
    const ex = createTableExtractor()
    const closedBlock = `\`\`\`json\n{"id":"old","key":"cx-demo-table","data":{"columns":[{"key":"x"}],"rows":[]}}\n\`\`\`\n`
    const text = `${closedBlock}\`\`\`json\n${tablePrefix}${col1}`
    const partial = ex.next(text) as CxStreamNode
    // 来自第二个（未闭合）块：1 列
    expect((partial.data!.columns as unknown[]).length).toBe(1)
  })

  it('解析失败 delta → lastValid 缓存防闪没', () => {
    const ex = createTableExtractor()
    const base = `${tablePrefix}${col1}],"rows":[`
    const good = ex.next(`${base}${row1}`)
    expect(good).not.toBeNull()

    // 构造一个有匹配但截断到无法修复的输入：
    // scanPaths 匹配到列，但截断位置之后混入非法内容使 repair 后结构不符
    // 简化：喂一个 trigger 扫描有匹配、但 parse 结果匹配不到 key 的输入 → 走 lastValid
    const weird = `{"key":"unregistered","data":{"columns":[${col1}`
    // 先注册扫描路径能匹配但 matchTrigger 命中的是另一个 key 的场景：
    // 这里直接验证：next 不返回 null（lastValid 保持）
    const r = ex.next(weird)
    expect(r).toBe(good)
  })

  it('全新输入流（空字符串）清除 lastValid', () => {
    const ex = createTableExtractor()
    ex.next(`${tablePrefix}${col1}`)
    ex.next('')
    // lastValid 已清：无匹配输入返回 null
    expect(ex.next('{"key":"cx-demo-table","data":{"x"')).toBeNull()
  })

  it('reset 清除缓存', () => {
    const ex = createTableExtractor()
    ex.next(`${tablePrefix}${col1}`)
    ex.reset()
    expect(ex.next('{"key":"cx-demo-table","data":{"x"')).toBeNull()
  })

  it('未注册的 key：静默返回 null', () => {
    const ex = createTableExtractor()
    expect(ex.next(`{"key":"cx-text","data":{"text":"你好"}`)).toBeNull()
  })

  it('空注册表：返回 null 不抛错', () => {
    const registry = createTriggerRegistry<CxSpec>()
    const ex = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    expect(ex.next(`${tablePrefix}${col1}`)).toBeNull()
  })

  it('数组根输入：按节点 key 匹配 trigger', () => {
    // 数组根下 data 路径变为 [*, 'data', ...]——trigger 注册数组根路径
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-demo-table', {
      scanPaths: [['*', 'data', 'rows', '*']],
      buildPartial: (spec) => {
        const nodes = Array.isArray(spec) ? spec : [spec]
        const node = nodes.find((n) => n.key === 'cx-demo-table')
        if (!node) return null
        const data = (node.data ?? {}) as Record<string, unknown>
        if (!Array.isArray(data.rows) || data.rows.length === 0) return null
        return { ...node, data: { ...data, rows: [...data.rows] } }
      },
    })
    const ex = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const text = `[{"key":"cx-demo-table","data":{"rows":[{"n":1},{"n":2}`
    const partial = ex.next(text) as CxStreamNode
    expect(partial.key).toBe('cx-demo-table')
    expect((partial.data!.rows as unknown[]).length).toBe(2)
  })
})
