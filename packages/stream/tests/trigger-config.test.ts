import { describe, expect, it } from 'vitest'
import { compileTrigger, fromArrayTriggerConfig } from '../src/cx-trigger-config'
import { createArrayTrigger } from '../src/cx-array-trigger'
import { scanBalancedItems } from '../src/core/bracket-scanner'

import type { ScanPath } from '../src/core/types'
import type { MatchesPerPath } from '../src/core/incremental'
import type { ArrayTriggerConfig } from '../src/cx-array-trigger'
import type { CxSpec, CxStreamNode } from '../src/cx'
import type { StreamTriggerConfig } from '../src/cx-trigger-config'

/** buildPartial 产物窄化为单节点（测试只构造单根 spec） */
function asNode(spec: CxSpec | null): CxStreamNode | null {
  if (spec === null || Array.isArray(spec)) return null
  return spec
}

/** 按路径集合对文本跑 bracket-scanner，构造 buildPartial 入参 matchesPerPath */
function matchesFor(text: string, paths: ScanPath[]): MatchesPerPath {
  const map: MatchesPerPath = new Map()
  for (const path of paths) {
    const matches = scanBalancedItems(text, path)
    if (matches.length > 0) map.set(JSON.stringify(path), matches)
  }
  return map
}

describe('compileTrigger 数组形态', () => {
  const tableConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-table',
    sections: [
      { kind: 'array', arrayKey: 'data', extraScanPaths: [['data', 'columns', '*']] },
    ],
  }

  it('scanPaths = 主数组路径 + extraScanPaths', () => {
    const trigger = compileTrigger(tableConfig)
    expect(trigger.scanPaths).toEqual([
      ['data', 'data', '*'],
      ['data', 'columns', '*'],
    ])
  })

  it('截断到完整行、残缺尾部不纳入（与 createArrayTrigger 行为一致）', () => {
    const text =
      '{"key":"cx-nuxt-ui-v4-table","data":{"data":[{"name":"Alice","age":30},{"name":"Bob","age":25},{"name":"Car'
    const paths = tableConfig.sections[0]!.kind === 'array'
      ? [['data', 'data', '*'] as ScanPath, ['data', 'columns', '*'] as ScanPath]
      : []
    const matches = matchesFor(text, paths)
    // jsonrepair 补全后的 parsed spec：第三行残缺被补成完整但语义不完整的对象
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-table',
      data: { data: [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }] },
    }

    const built = asNode(compileTrigger(tableConfig).buildPartial(spec, matches))

    expect(built?.data?.data).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ])
    // 全新引用（渲染端变化检测依赖）
    expect(built).not.toBe(spec)
    expect(built?.data).not.toBe(spec.data)
  })

  it('纯数组形态 complete===0 → null（守卫提升后语义不变，交 lastValid 保持上帧）', () => {
    const spec: CxSpec = { key: 'cx-nuxt-ui-v4-table', data: { data: [] } }
    const built = compileTrigger(tableConfig).buildPartial(spec, new Map())
    expect(built).toBeNull()
  })

  it('未命中 key 的 spec → null', () => {
    const spec: CxSpec = { key: 'other', data: { data: [{ a: 1 }] } }
    const matches = matchesFor('{"key":"other","data":{"data":[{"a":1}]}}', [['data', 'data', '*']])
    expect(compileTrigger(tableConfig).buildPartial(spec, matches)).toBeNull()
  })

  // 中间态守卫：region 与 stateBranch 形态编译落地前必须显式拒绝，
  // 静默忽略会让声明退化为纯数组形态且无任何报错。
  it('region 形态显式 throw（编译落地前的防静默退化守卫）', () => {
    expect(() =>
      compileTrigger({ key: 'k', sections: [{ kind: 'region', slots: ['header'] }] }),
    ).toThrow(/region 形态尚未实现/)
  })

  it('stateBranch.emptyPassthrough 显式 throw（同上守卫）', () => {
    expect(() =>
      compileTrigger({
        key: 'k',
        sections: [{ kind: 'array', arrayKey: 'data' }],
        stateBranch: { emptyPassthrough: true },
      }),
    ).toThrow(/stateBranch 尚未实现/)
  })

  // 契约上限为至多一个 array 形态：find 只取首个会让第二个数组永不切分，
  // 与静默退化同害，必须显式拒绝。
  it('多 array 形态显式 throw（超出契约上限）', () => {
    expect(() =>
      compileTrigger({
        key: 'k',
        sections: [
          { kind: 'array', arrayKey: 'a' },
          { kind: 'array', arrayKey: 'b' },
        ],
      }),
    ).toThrow(/至多一个 array/)
  })
})

describe('fromArrayTriggerConfig 迁移同一性', () => {
  function deriveChartTailFields(completeRows: unknown[]): Record<string, unknown> {
    const first = completeRows[0]
    if (!first || typeof first !== 'object') return {}
    const keys = Object.keys(first as Record<string, unknown>)
    return {
      xKey: keys[0],
      series: keys.slice(1).map((k) => ({ key: k, label: k })),
    }
  }

  const chartOld: ArrayTriggerConfig = {
    key: 'cx-vtu-chart',
    arrayKey: 'data',
    extraScanPaths: [['data', 'series', '*']],
    deriveTailFields: deriveChartTailFields,
  }

  it('包装后 scanPaths 与原工厂一致', () => {
    expect(compileTrigger(fromArrayTriggerConfig(chartOld)).scanPaths).toEqual(
      createArrayTrigger(chartOld).scanPaths,
    )
  })

  it('包装后 buildPartial 与原工厂逐样本等价（含 deriveTailFields ??= 语义）', () => {
    const compiled = compileTrigger(fromArrayTriggerConfig(chartOld))
    const original = createArrayTrigger(chartOld)
    const text = '{"key":"cx-vtu-chart","data":{"data":[{"month":"Jan","revenue":100},{"month":"Feb","revenue":120}]}}'
    const paths: ScanPath[] = [['data', 'data', '*'], ['data', 'series', '*']]
    const matches = matchesFor(text, paths)
    // xKey/series 尾随缺席：parsed spec 只有 data 数组
    const spec: CxSpec = {
      key: 'cx-vtu-chart',
      data: { data: [{ month: 'Jan', revenue: 100 }, { month: 'Feb', revenue: 120 }] },
    }

    const a = asNode(compiled.buildPartial(spec, matches))
    const b = original.buildPartial(spec, matches)

    expect(a).toEqual(b)
    // deriveTailFields 补齐：首字段作 xKey，其余作 series
    expect(a?.data?.xKey).toBe('month')
    expect(a?.data?.series).toEqual([{ key: 'revenue', label: 'revenue' }])
  })

  // ??= 语义的核心契约：尾随字段已真实传输时不被推导值覆盖
  it('deriveTailFields 不覆盖已传输的真实字段', () => {
    const compiled = compileTrigger(fromArrayTriggerConfig(chartOld))
    const text = '{"key":"cx-vtu-chart","data":{"data":[{"month":"Jan","revenue":100}]}}'
    const matches = matchesFor(text, [['data', 'data', '*'], ['data', 'series', '*']])
    const spec: CxSpec = {
      key: 'cx-vtu-chart',
      data: {
        data: [{ month: 'Jan', revenue: 100 }],
        xKey: 'month',
        series: [{ key: 'revenue', label: '营收' }],
      },
    }

    const built = asNode(compiled.buildPartial(spec, matches))

    expect(built?.data?.series).toEqual([{ key: 'revenue', label: '营收' }])
  })
})
