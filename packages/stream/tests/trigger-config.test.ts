import { describe, expect, it } from 'vitest'
import { compileTrigger, fromArrayTriggerConfig } from '../src/cx-trigger-config'
import { createArrayTrigger } from '../src/cx-array-trigger'
import { scanBalancedItems } from '../src/core/bracket-scanner'
import { createIncrementalExtractor, createTriggerRegistry } from '../src/core/incremental'
import { matchCxTrigger } from '../src/cx'

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

  // 中间态守卫：stateBranch 形态编译落地前必须显式拒绝，
  // 静默忽略会让声明退化为纯数组形态且无任何报错。
  it('stateBranch.emptyPassthrough 显式 throw（编译落地前的防静默退化守卫）', () => {
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

describe('compileTrigger region 形态', () => {
  const cardConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-card',
    sections: [{ kind: 'region', slots: ['header', 'default', 'footer'] }],
  }
  const slotPaths: ScanPath[] = [
    ['components', 'header', '*'],
    ['components', 'default', '*'],
    ['components', 'footer', '*'],
  ]

  it('scanPaths = 每 slot 一条 components 分组路径（声明序）', () => {
    expect(compileTrigger(cardConfig).scanPaths).toEqual(slotPaths)
  })

  it('中段：完整区域揭示、流式中区域显式移除（不依赖管线物理截断）', () => {
    // footer 项括号未平衡 → 匹配计数 0
    const text =
      '{"key":"cx-nuxt-ui-v4-card","data":{"title":"周报"},"components":{"header":[{"key":"h1"}],"default":[{"key":"d1"}],"footer":[{"key":"f1"'
    const matches = matchesFor(text, slotPaths)
    // 模拟 jsonrepair 产物：footer 被补成含残缺项的数组——buildPartial 契约层必须剔除
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      data: { title: '周报' },
      components: {
        header: [{ key: 'h1' }],
        default: [{ key: 'd1' }],
        footer: [{ key: 'f1' }],
      },
    }

    const built = asNode(compileTrigger(cardConfig).buildPartial(spec, matches))

    expect(built?.components).toEqual({
      header: [{ key: 'h1' }],
      default: [{ key: 'd1' }],
    })
    // data 标量随容器就位
    expect(built?.data?.title).toBe('周报')
  })

  it('区域内截断：2 完整项 + 1 残缺项 → 截断到 2', () => {
    const text =
      '{"key":"cx-nuxt-ui-v4-card","components":{"header":[{"key":"h1"},{"key":"h2"},{"key":"h'
    const matches = matchesFor(text, slotPaths)
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      components: { header: [{ key: 'h1' }, { key: 'h2' }, { key: 'h3' }] },
    }

    const built = asNode(compileTrigger(cardConfig).buildPartial(spec, matches))

    expect(built?.components).toEqual({ header: [{ key: 'h1' }, { key: 'h2' }] })
  })

  it('所有声明区域计数 0 → null（整体守卫交 lastValid）', () => {
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      components: { header: [{ key: 'h1' }] },
    }
    expect(compileTrigger(cardConfig).buildPartial(spec, new Map())).toBeNull()
  })

  it('components 为数组形态（非 slot 分组）时 region 不可构造 → null', () => {
    // 契约外输入：声明 region 的组件要求生成侧按 slot 分组序列化；
    // 数组形态不属 region 字段域，不干预但也不构成可构造内容
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      components: [{ key: 'free1' }],
    }
    expect(compileTrigger(cardConfig).buildPartial(spec, new Map())).toBeNull()
  })
})

describe('compileTrigger array+region 组合', () => {
  const footerColumnsConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-footer-columns',
    sections: [
      { kind: 'array', arrayKey: 'columns' },
      { kind: 'region', slots: ['left', 'right'] },
    ],
  }
  const allPaths: ScanPath[] = [
    ['data', 'columns', '*'],
    ['components', 'left', '*'],
    ['components', 'right', '*'],
  ]

  it('scanPaths = 数组段 + 区域段汇聚', () => {
    expect(compileTrigger(footerColumnsConfig).scanPaths).toEqual(allPaths)
  })

  it('列数组缺席时区域先现：complete===0 不短路 region（守卫提升核心场景）', () => {
    // columns 未开始传输、left 区域已完整——array 段 0 完整项若段内短路，
    // left 区域会被一并拖入 lastValid 等待
    const text = '{"key":"cx-nuxt-ui-v4-footer-columns","data":{},"components":{"left":[{"key":"l1"}]}}'
    const matches = matchesFor(text, allPaths)
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-footer-columns',
      data: {},
      components: { left: [{ key: 'l1' }] },
    }

    const built = asNode(compileTrigger(footerColumnsConfig).buildPartial(spec, matches))

    expect(built?.components).toEqual({ left: [{ key: 'l1' }] })
    // data 无完整列，原样携带（不含截断行）
    expect(built?.data).toEqual({})
  })

  it('两形态同时就位：列截断 + 区域过滤各动各的字段域', () => {
    const text =
      '{"key":"cx-nuxt-ui-v4-footer-columns","data":{"columns":[{"t":"关于"},{"t":"联系"}]},"components":{"left":[{"key":"l1"}],"right":[{"key":"r1"'
    const matches = matchesFor(text, allPaths)
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-footer-columns',
      data: { columns: [{ t: '关于' }, { t: '联系' }] },
      components: { left: [{ key: 'l1' }], right: [{ key: 'r1' }] },
    }

    const built = asNode(compileTrigger(footerColumnsConfig).buildPartial(spec, matches))

    expect(built?.data?.columns).toEqual([{ t: '关于' }, { t: '联系' }])
    expect(built?.components).toEqual({ left: [{ key: 'l1' }] })
    expect(built).not.toBe(spec)
    expect(built?.components).not.toBe(spec.components)
  })

  it('array produced 时数组形态 components（契约外输入）原引用携带', () => {
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-footer-columns',
      data: { columns: [{ t: '关于' }] },
      components: [{ key: 'free1' }],
    }
    const text = '{"key":"cx-nuxt-ui-v4-footer-columns","data":{"columns":[{"t":"关于"}]},"components":[{"key":"free1"}]}'
    const matches = matchesFor(text, allPaths)

    const built = asNode(compileTrigger(footerColumnsConfig).buildPartial(spec, matches))

    expect(built?.components).toBe(spec.components)
  })
})

describe('compileTrigger 经真实管线端到端', () => {
  const cardConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-card',
    sections: [{ kind: 'region', slots: ['header', 'default', 'footer'] }],
  }

  it('card 流式：中段两区揭示 + footer 未闭合缺席 → 全段三区齐', () => {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-nuxt-ui-v4-card', compileTrigger(cardConfig))
    const extractor = createIncrementalExtractor({ registry, matchTrigger: matchCxTrigger })

    const mid = asNode(
      extractor.next(
        '{"key":"cx-nuxt-ui-v4-card","data":{"title":"周报"},"components":{"header":[{"key":"h1"}],"default":[{"key":"d1"}],"footer":[{"key":"f1"',
      ),
    )
    expect(mid?.components).toEqual({ header: [{ key: 'h1' }], default: [{ key: 'd1' }] })
    expect(mid?.data?.title).toBe('周报')

    const full = asNode(
      extractor.next(
        '{"key":"cx-nuxt-ui-v4-card","data":{"title":"周报"},"components":{"header":[{"key":"h1"}],"default":[{"key":"d1"}],"footer":[{"key":"f1"}]}}',
      ),
    )
    expect(full?.components).toEqual({
      header: [{ key: 'h1' }],
      default: [{ key: 'd1' }],
      footer: [{ key: 'f1' }],
    })
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
