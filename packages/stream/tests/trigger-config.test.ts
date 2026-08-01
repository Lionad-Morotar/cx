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

describe('compileTrigger stateBranch 空态透传', () => {
  const tableEmptyConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-table',
    sections: [{ kind: 'array', arrayKey: 'data' }],
    stateBranch: { emptyPassthrough: true },
  }

  it('scanPaths 追加容器级闭合信号路径（不带 *）', () => {
    expect(compileTrigger(tableEmptyConfig).scanPaths).toEqual([
      ['data', 'data', '*'],
      ['data', 'data'],
    ])
  })

  it('空表闭合：透传 partial（携带空数组）而非 null 交 lastValid', () => {
    // 空态断言依赖容器级闭合信号：主数组闭合且 0 完整行 ⟺ 真空表，
    // 透传节点由组件内置空态接管渲染
    const text = '{"key":"cx-nuxt-ui-v4-table","data":{"data":[]}}'
    const matches = matchesFor(text, [['data', 'data', '*'], ['data', 'data']])
    const spec: CxSpec = { key: 'cx-nuxt-ui-v4-table', data: { data: [] } }

    const built = asNode(compileTrigger(tableEmptyConfig).buildPartial(spec, matches))

    expect(built).not.toBeNull()
    expect(built?.data?.data).toEqual([])
    expect(built).not.toBe(spec)
  })

  it('主数组未闭合（行传输中）→ null 不干预（暂无数据可能只是还没传到）', () => {
    const text = '{"key":"cx-nuxt-ui-v4-table","data":{"data":[{"name":"Al'
    const matches = matchesFor(text, [['data', 'data', '*'], ['data', 'data']])
    const spec: CxSpec = { key: 'cx-nuxt-ui-v4-table', data: {} }

    expect(compileTrigger(tableEmptyConfig).buildPartial(spec, matches)).toBeNull()
  })

  it('闭合且含完整行 → 走 array 段正常截断（空态透传不触发）', () => {
    const text = '{"key":"cx-nuxt-ui-v4-table","data":{"data":[{"name":"Alice"}]}}'
    const matches = matchesFor(text, [['data', 'data', '*'], ['data', 'data']])
    const spec: CxSpec = { key: 'cx-nuxt-ui-v4-table', data: { data: [{ name: 'Alice' }] } }

    const built = asNode(compileTrigger(tableEmptyConfig).buildPartial(spec, matches))

    expect(built?.data?.data).toEqual([{ name: 'Alice' }])
  })

  it('契约前提显式拒绝：无 array 形态时 emptyPassthrough 无法编译闭合信号', () => {
    expect(() =>
      compileTrigger({
        key: 'k',
        sections: [{ kind: 'region', slots: ['header'] }],
        stateBranch: { emptyPassthrough: true },
      }),
    ).toThrow(/stateBranch 要求 array 形态/)
  })

  it('组合：空表闭合 + 区域完整 → 空数组透传与区域揭示兼容', () => {
    const config: StreamTriggerConfig = {
      key: 'cx-nuxt-ui-v4-footer-columns',
      sections: [
        { kind: 'array', arrayKey: 'columns' },
        { kind: 'region', slots: ['left'] },
      ],
      stateBranch: { emptyPassthrough: true },
    }
    const paths: ScanPath[] = [
      ['data', 'columns', '*'],
      ['components', 'left', '*'],
      ['data', 'columns'],
    ]
    const text =
      '{"key":"cx-nuxt-ui-v4-footer-columns","data":{"columns":[]},"components":{"left":[{"key":"l1"}]}}'
    const matches = matchesFor(text, paths)
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-footer-columns',
      data: { columns: [] },
      components: { left: [{ key: 'l1' }] },
    }

    const built = asNode(compileTrigger(config).buildPartial(spec, matches))

    expect(built?.data?.columns).toEqual([])
    expect(built?.components).toEqual({ left: [{ key: 'l1' }] })
  })

  it('端到端：空表闭合帧产出透传 partial 而非 lastValid 保持', () => {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-nuxt-ui-v4-table', compileTrigger(tableEmptyConfig))
    const extractor = createIncrementalExtractor({ registry, matchTrigger: matchCxTrigger })

    // 首帧 spec 未完整 → null；闭合帧 → 透传（若走 lastValid 将一直是 null）
    const built = asNode(
      extractor.next('{"key":"cx-nuxt-ui-v4-table","data":{"data":[]}}'),
    )

    expect(built?.data?.data).toEqual([])
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

describe('compileTrigger scalar 形态', () => {
  const articleConfig: StreamTriggerConfig = {
    key: 'cx-vtu-article',
    sections: [
      {
        kind: 'scalar',
        fallbackData: { type: 'md', content: '' },
        skeletonFields: ['content'],
      },
    ],
    frameStride: 10,
  }

  it('无 scanPaths、声明闭合事件与节流透传', () => {
    const trigger = compileTrigger(articleConfig)
    expect(trigger.scanPaths).toEqual([])
    expect(trigger.usesClosureEvents).toBe(true)
    expect(trigger.frameStride).toBe(10)
  })

  it('buildPartial 恒产帧：无 data 节点 → fallback 填充 + 骨架标记', () => {
    const built = asNode(compileTrigger(articleConfig).buildPartial({ key: 'cx-vtu-article' }, new Map()))
    expect(built?.data).toEqual({ type: 'md', content: '', _cx_streaming: ['content'] })
  })

  it('fallbackData ??= 语义：真实字段已传输则不覆盖', () => {
    const spec: CxSpec = {
      key: 'cx-vtu-article',
      data: { type: 'html', content: '<p>x</p>' },
    }
    const built = asNode(compileTrigger(articleConfig).buildPartial(spec, new Map()))
    expect(built?.data?.type).toBe('html')
    expect(built?.data?.content).toBe('<p>x</p>')
    // skeleton 字段已传输 → 不注入标记
    expect(built?.data).not.toHaveProperty('_cx_streaming')
  })

  it('skeleton 字段部分传输：只标记未传输字段', () => {
    const config: StreamTriggerConfig = {
      key: 'k',
      sections: [{ kind: 'scalar', skeletonFields: ['content', 'summary'] }],
    }
    const built = asNode(
      compileTrigger(config).buildPartial({ key: 'k', data: { content: '正文' } }, new Map()),
    )
    expect(built?.data?._cx_streaming).toEqual(['summary'])
  })

  it('scalar + array / region 组合显式 throw（截断源语义冲突）', () => {
    expect(() =>
      compileTrigger({
        key: 'k',
        sections: [{ kind: 'scalar' }, { kind: 'array', arrayKey: 'rows' }],
      }),
    ).toThrow(/scalar 形态不与/)
    expect(() =>
      compileTrigger({
        key: 'k',
        sections: [{ kind: 'scalar' }, { kind: 'region', slots: ['header'] }],
      }),
    ).toThrow(/scalar 形态不与/)
  })

  it('未命中 key 的 spec → null', () => {
    expect(
      compileTrigger(articleConfig).buildPartial({ key: 'other', data: {} }, new Map()),
    ).toBeNull()
  })
})

describe('compileTrigger scalar 经真实管线端到端', () => {
  const articleConfig: StreamTriggerConfig = {
    key: 'cx-vtu-article',
    sections: [
      {
        kind: 'scalar',
        fallbackData: { type: 'md', content: '' },
        skeletonFields: ['content'],
      },
    ],
  }

  function createArticleExtractor(extra?: (registry: ReturnType<typeof createTriggerRegistry<CxSpec>>) => void) {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-vtu-article', compileTrigger(articleConfig))
    extra?.(registry)
    return createIncrementalExtractor({ registry, matchTrigger: matchCxTrigger })
  }

  it('key 检出即空壳帧（首帧不受节流），content 骨架标记在', () => {
    const extractor = createArticleExtractor()
    const shell = asNode(extractor.next('{"key":"cx-vtu-article"'))
    expect(shell).toEqual({
      key: 'cx-vtu-article',
      data: { type: 'md', content: '', _cx_streaming: ['content'] },
    })
  })

  it('content 流式中段：帧保持同引用且绝无半值', () => {
    const extractor = createArticleExtractor()
    extractor.next('{"key":"cx-vtu-article"')
    const typed = asNode(extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述'))
    expect(typed?.data).toEqual({ type: 'md', content: '', _cx_streaming: ['content'] })

    // content 持续增长但无新闭合：帧不变（lastValid 同引用），半值不上屏
    const growing = extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述\n\n正文**加')
    expect(growing).toBe(typed)
  })

  it('content 闭合整现、骨架标记移除；title 与 tags 随后揭示', () => {
    const extractor = createArticleExtractor()
    extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述')

    const revealed = asNode(
      extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述\n\n正文","title":"周'),
    )
    expect(revealed?.data?.content).toBe('## 概述\n\n正文')
    expect(revealed?.data).not.toHaveProperty('_cx_streaming')
    // title 流式中：不注入半值
    expect(revealed?.data).not.toHaveProperty('title')

    const titled = asNode(
      extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述\n\n正文","title":"周报","tags":["vue","low-code"]}'),
    )
    expect(titled?.data?.title).toBe('周报')
    expect(titled?.data?.tags).toEqual(['vue', 'low-code'])
  })

  it('tags 字符串项逐项揭示（截断至项闭合点）', () => {
    const extractor = createArticleExtractor()
    const mid = asNode(
      extractor.next('{"key":"cx-vtu-article","data":{"type":"md","tags":["vue","low'),
    )
    expect(mid?.data?.tags).toEqual(['vue'])
  })

  it('末位数字字段无逗号：由 } 收尾揭示', () => {
    const extractor = createArticleExtractor()
    extractor.next('{"key":"cx-vtu-article","data":{"type":"md","readingTime":3')
    const built = asNode(
      extractor.next('{"key":"cx-vtu-article","data":{"type":"md","readingTime":3}}'),
    )
    expect(built?.data?.readingTime).toBe(3)
  })

  it('frameStride：窗口内合并、到期补出、首帧立即', () => {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register(
      'cx-vtu-article',
      compileTrigger({ ...articleConfig, frameStride: 3 }),
    )
    const extractor = createIncrementalExtractor({ registry, matchTrigger: matchCxTrigger })

    // d1：首帧（空壳）立即出，不受节流
    const shell = asNode(extractor.next('{"key":"cx-vtu-article"'))
    expect(shell?.data).toHaveProperty('type', 'md')

    // d2：type 闭合但距首帧 1 delta < 3 → 节流，帧保持
    const d2 = extractor.next('{"key":"cx-vtu-article","data":{"type":"md"')
    expect(d2).toBe(shell)

    // d3：无新闭合（title 流式中），窗口未满 → 帧保持
    const d3 = extractor.next('{"key":"cx-vtu-article","data":{"type":"md","title":"周')
    expect(d3).toBe(shell)

    // d4：窗口到期（4-1=3）→ 被节流的 type 帧补出
    const d4 = asNode(extractor.next('{"key":"cx-vtu-article","data":{"type":"md","title":"周报'))
    expect(d4).not.toBe(shell)

    // d5-d6：content 闭合但窗口未满（6-4=2 < 3）→ 节流，帧保持
    extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"x"')
    const d6 = extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"x"}')
    expect(d6).toBe(d4)

    // d7：窗口到期 → content 帧补出
    const d7 = asNode(extractor.next('{"key":"cx-vtu-article","data":{"type":"md","content":"x"}}'))
    expect(d7?.data?.content).toBe('x')
  })

  it('混合注册表：scalar 注册不影响数组形态（空匹配不产帧、行闭合正常）', () => {
    const planConfig: StreamTriggerConfig = {
      key: 'cx-vtu-plan',
      sections: [{ kind: 'array', arrayKey: 'todos' }],
    }
    const extractor = createArticleExtractor((registry) => {
      registry.register('cx-vtu-plan', compileTrigger(planConfig))
    })

    // plan 围栏早期：闭合事件分支激活但数组形态空匹配 → 无帧（既有行为）
    const early = extractor.next('{"key":"cx-vtu-plan","data":{"todos":[{"title":"买')
    expect(early).toBeNull()

    // 行闭合后：数组形态主链正常出帧
    const row = asNode(
      extractor.next('{"key":"cx-vtu-plan","data":{"todos":[{"title":"买菜","done":false}'),
    )
    expect(row?.data?.todos).toEqual([{ title: '买菜', done: false }])

    // 换到 article 围栏：文本比较判据跨围栏安全，空壳帧正常产出
    const shell = asNode(extractor.next('{"key":"cx-vtu-article"'))
    expect(shell?.key).toBe('cx-vtu-article')
  })

  it('无 scalar 注册的注册表：数组形态早期行为与既有逐位一致（无帧不解析）', () => {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register(
      'cx-vtu-plan',
      compileTrigger({ key: 'cx-vtu-plan', sections: [{ kind: 'array', arrayKey: 'todos' }] }),
    )
    const extractor = createIncrementalExtractor({ registry, matchTrigger: matchCxTrigger })
    expect(extractor.next('{"key":"cx-vtu-plan","data":{"todos":[{"title":"买')).toBeNull()
  })
})
