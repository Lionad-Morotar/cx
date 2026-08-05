import { describe, expect, it } from 'vitest'
import { compileTreeTrigger } from '../src/cx-tree-trigger'
import { createIncrementalExtractor, createTriggerRegistry } from '../src/core/incremental'
import { matchCxTrigger } from '../src/cx'

import type { CxSpec, CxStreamNode } from '../src/cx'
import type { StreamTriggerConfig } from '../src/cx-trigger-config'

/** buildPartial 产物窄化为单节点（测试只构造单根 spec） */
function asNode(spec: CxSpec | null): CxStreamNode | null {
  if (spec === null || Array.isArray(spec)) return null
  return spec
}

/** 递归收集树中全部节点（不过滤 key——半节点正是要暴露的对象） */
function collectAllNodes(node: CxStreamNode): CxStreamNode[] {
  const out: CxStreamNode[] = [node]
  const slots = node.components ?? {}
  if (Array.isArray(slots)) {
    for (const child of slots) out.push(...collectAllNodes(child))
  } else {
    for (const children of Object.values(slots)) {
      for (const child of children) out.push(...collectAllNodes(child))
    }
  }
  return out
}

describe('compileTreeTrigger 声明', () => {
  it('scanPaths 为空、声明 usesClosureEvents、frameStride 透传 opts', () => {
    const trigger = compileTreeTrigger([], { frameStride: 5 })
    expect(trigger.scanPaths).toEqual([])
    expect(trigger.usesClosureEvents).toBe(true)
    expect(trigger.frameStride).toBe(5)
  })

  it('frameStride 缺省为 1（每 delta 可出帧）', () => {
    expect(compileTreeTrigger([]).frameStride).toBe(1)
  })
})

describe('compileTreeTrigger region 形态', () => {
  const cardConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-card',
    sections: [{ kind: 'region', slots: ['header', 'default', 'footer'] }],
  }

  it('声明 slot 空数组保留（终态陷阱：空数组是合法终态，closure 不会伪造）；未声明 slot 原样保留', () => {
    const trigger = compileTreeTrigger([cardConfig])
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      components: { header: [], extra: [{ key: 'cx-header-bar' }] },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    expect(built?.components).toEqual({
      header: [],
      extra: [{ key: 'cx-header-bar' }],
    })
  })

  it('声明 slot 全部缺席 → 无产出剔除（对齐组件级守卫）', () => {
    const trigger = compileTreeTrigger([cardConfig])
    expect(trigger.buildPartial({ key: 'cx-nuxt-ui-v4-card' }, new Map())).toBeNull()
    expect(
      trigger.buildPartial(
        { key: 'cx-nuxt-ui-v4-card', components: { extra: [{ key: 'cx-header-bar' }] } },
        new Map(),
      ),
    ).toBeNull()
  })

  it('region slot 内嵌 array 物料：子节点按自身 config 判定产出', () => {
    const tableConfig: StreamTriggerConfig = {
      key: 'cx-vtu-data-table',
      sections: [{ kind: 'array', arrayKey: 'data' }],
    }
    const trigger = compileTreeTrigger([cardConfig, tableConfig])
    const spec: CxSpec = {
      key: 'cx-nuxt-ui-v4-card',
      components: {
        default: [
          { key: 'cx-vtu-data-table', data: { data: [{ name: 'Alice' }] } },
          { key: 'cx-vtu-data-table' }, // 主数组未开始 → 剔除
        ],
      },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    const children = (built?.components as Record<string, CxStreamNode[]>)?.default ?? []
    expect(children.length).toBe(1)
    expect((children[0]?.data?.data as unknown[]).length).toBe(1)
  })
})

describe('compileTreeTrigger 组合形态（array + region）', () => {
  const footerColumnsConfig: StreamTriggerConfig = {
    key: 'cx-nuxt-ui-v4-footer-columns',
    sections: [
      { kind: 'array', arrayKey: 'columns' },
      { kind: 'region', slots: ['left', 'right'] },
    ],
  }

  it('各形态独立判定、整体守卫在末尾：任一形态有产出即保留', () => {
    const trigger = compileTreeTrigger([footerColumnsConfig])
    // array 缺席、region 有产出 → 保留
    const byRegion = asNode(
      trigger.buildPartial(
        { key: 'cx-nuxt-ui-v4-footer-columns', components: { left: [{ key: 'cx-header-bar' }] } },
        new Map(),
      ),
    )
    expect(byRegion).not.toBeNull()
    // region 缺席、array 有产出 → 保留
    const byArray = asNode(
      trigger.buildPartial(
        { key: 'cx-nuxt-ui-v4-footer-columns', data: { columns: [{ title: 'A' }] } },
        new Map(),
      ),
    )
    expect(byArray).not.toBeNull()
    // 均无产出 → 剔除
    expect(trigger.buildPartial({ key: 'cx-nuxt-ui-v4-footer-columns' }, new Map())).toBeNull()
  })
})

describe('compileTreeTrigger array 形态', () => {
  const tableConfig: StreamTriggerConfig = {
    key: 'cx-vtu-data-table',
    sections: [
      // extraScanPaths 在树级模式忽略（closure 天然逐行），声明仅验证不报错
      { kind: 'array', arrayKey: 'data', extraScanPaths: [['data', 'columns', '*']] },
    ],
  }
  const chartConfig: StreamTriggerConfig = {
    key: 'cx-vtu-chart',
    sections: [
      { kind: 'array', arrayKey: 'data', deriveTailFields: (rows) => ({ total: rows.length }) },
    ],
  }

  it('主数组逐项完整出帧（closure 截断保证 parsed 行皆完整）', () => {
    const trigger = compileTreeTrigger([tableConfig])
    const spec: CxSpec = {
      key: 'cx-vtu-data-table',
      data: { data: [{ name: 'Alice' }, { name: 'Bob' }] },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    expect((built?.data?.data as unknown[]).length).toBe(2)
  })

  it('deriveTailFields ??= 补齐尾随字段，真实字段不被覆盖', () => {
    const trigger = compileTreeTrigger([chartConfig])
    const built = asNode(
      trigger.buildPartial(
        { key: 'cx-vtu-chart', data: { data: [{ v: 1 }, { v: 2 }], total: 99 } },
        new Map(),
      ),
    )
    expect(built?.data?.total).toBe(99)
    const derived = asNode(
      trigger.buildPartial({ key: 'cx-vtu-chart', data: { data: [{ v: 1 }] } }, new Map()),
    )
    expect(derived?.data?.total).toBe(1)
  })

  it('主数组缺席 → 节点剔除（对齐组件级 complete===0 不挂载语义）', () => {
    const trigger = compileTreeTrigger([tableConfig])
    expect(trigger.buildPartial({ key: 'cx-vtu-data-table' }, new Map())).toBeNull()
    expect(
      trigger.buildPartial({ key: 'cx-vtu-data-table', data: { columns: [] } }, new Map()),
    ).toBeNull()
  })

  it('空主数组：emptyPassthrough 透传空态，未声明则剔除', () => {
    const passthroughConfig: StreamTriggerConfig = {
      key: 'cx-nuxt-ui-v4-table',
      sections: [{ kind: 'array', arrayKey: 'data' }],
      stateBranch: { emptyPassthrough: true },
    }
    const spec: CxSpec = { key: 'cx-nuxt-ui-v4-table', data: { data: [] } }
    expect(
      asNode(compileTreeTrigger([passthroughConfig]).buildPartial(spec, new Map()))?.data,
    ).toEqual({ data: [] })
    expect(
      compileTreeTrigger([tableConfig]).buildPartial(
        { key: 'cx-vtu-data-table', data: { data: [] } },
        new Map(),
      ),
    ).toBeNull()
  })

  it('嵌套在 slot 内的 array 物料主数组缺席时剔除该节点，sibling 不受影响', () => {
    const trigger = compileTreeTrigger([tableConfig])
    const spec: CxSpec = {
      id: 'root',
      key: 'cx-page-main',
      components: {
        default: [
          { id: 't1', key: 'cx-vtu-data-table' },
          { id: 'h1', key: 'cx-header-bar' },
        ],
      },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    const children = (built?.components as Record<string, CxStreamNode[]>)?.default ?? []
    expect(children.map((n) => n.id)).toEqual(['h1'])
  })
})

describe('compileTreeTrigger 契约校验（与 compileTrigger 同一契约）', () => {
  it('scalar 与 array/region 组合显式拒绝（静默降级会让两验收页行为分裂）', () => {
    expect(() =>
      compileTreeTrigger([
        {
          key: 'cx-x',
          sections: [
            { kind: 'scalar', fallbackData: {} },
            { kind: 'array', arrayKey: 'rows' },
          ],
        },
      ]),
    ).toThrow(/scalar/)
  })

  it('每 config 至多一个 array 形态', () => {
    expect(() =>
      compileTreeTrigger([
        {
          key: 'cx-x',
          sections: [
            { kind: 'array', arrayKey: 'a' },
            { kind: 'array', arrayKey: 'b' },
          ],
        },
      ]),
    ).toThrow(/array/)
  })

  it('stateBranch.emptyPassthrough 要求 array 形态', () => {
    expect(() =>
      compileTreeTrigger([
        {
          key: 'cx-x',
          sections: [{ kind: 'region', slots: ['default'] }],
          stateBranch: { emptyPassthrough: true },
        },
      ]),
    ).toThrow(/stateBranch/)
  })
})

describe('compileTreeTrigger 端到端（extractor 喂流）', () => {
  const articleConfig: StreamTriggerConfig = {
    key: 'cx-vtu-article',
    sections: [
      { kind: 'scalar', fallbackData: { type: 'md', content: '' }, skeletonFields: ['content'] },
    ],
  }
  const tableConfig: StreamTriggerConfig = {
    key: 'cx-vtu-data-table',
    sections: [{ kind: 'array', arrayKey: 'data' }],
  }

  // 嵌套页面树剧本（pretty JSON，行 = 字段边界）：table 三行 + article 长文
  const script = JSON.stringify(
    [
      {
        id: 'root',
        key: 'cx-page-main',
        components: {
          default: [
            {
              id: 't1',
              key: 'cx-vtu-data-table',
              data: { data: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }] },
            },
            {
              id: 'a1',
              key: 'cx-vtu-article',
              data: { type: 'md', content: '# 标题\n\n正文内容' },
            },
          ],
        },
      },
    ],
    null,
    2,
  )

  function createTreeExtractor() {
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-page-main', compileTreeTrigger([articleConfig, tableConfig]))
    return createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
  }

  function tableRows(spec: CxSpec | null): number {
    if (!spec) return -1
    const root = Array.isArray(spec) ? spec[0] : spec
    const children = (root?.components as Record<string, CxStreamNode[]>)?.default ?? []
    const table = children.find((n) => n.key === 'cx-vtu-data-table')
    const rows = table?.data?.data
    return Array.isArray(rows) ? rows.length : -1
  }

  it('逐比例前缀出帧：table 行数单调不减至 3，全程无 key 缺失节点', () => {
    const extractor = createTreeExtractor()
    const counts: number[] = []
    for (const pct of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
      const spec = extractor.next(script.slice(0, Math.floor((script.length * pct) / 100)))
      counts.push(tableRows(spec))
      if (spec) {
        const nodes = collectAllNodes((Array.isArray(spec) ? spec[0] : spec)!)
        expect(nodes.every((n) => typeof n.key === 'string')).toBe(true)
      }
    }
    const seen = counts.filter((n) => n >= 0)
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!).toBeGreaterThanOrEqual(seen[i - 1]!)
    }
    expect(counts.at(-1)).toBe(3)
    // 逐行生长真实发生（中间帧出现过 0 < n < 3 的部分行数）
    expect(seen.some((n) => n > 0 && n < 3)).toBe(true)
  })

  it('scalar 骨架标记中途帧出现、终态帧消失', () => {
    const extractor = createTreeExtractor()
    // article 的 key 在剧本 ~73% 处才闭合，固定单点断言会撞上未挂载窗口构成假绿——
    // 循环收集各比例帧，显式断言「中途至少一帧带标记」且「终态无标记」
    const markerStates: boolean[] = []
    for (const pct of [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
      const spec = extractor.next(script.slice(0, Math.floor((script.length * pct) / 100)))
      const root = Array.isArray(spec) ? spec[0] : spec
      const article = (
        root?.components as Record<string, CxStreamNode[]> | undefined
      )?.default?.find((n) => n.key === 'cx-vtu-article')
      if (article) {
        const streaming = article.data?._cx_streaming
        markerStates.push(Array.isArray(streaming) && streaming.length > 0)
      }
    }
    expect(markerStates.length).toBeGreaterThan(0)
    expect(markerStates).toContain(true)

    const final = extractor.next(script)
    const finalRoot = (Array.isArray(final) ? final[0] : final)!
    const finalArticle = (finalRoot.components as Record<string, CxStreamNode[]>).default!.find(
      (n) => n.key === 'cx-vtu-article',
    )
    expect(finalArticle?.data?._cx_streaming).toBeUndefined()
    expect(finalArticle?.data?.content).toBe('# 标题\n\n正文内容')
  })
})

describe('compileTreeTrigger scalar 形态', () => {
  const articleConfig: StreamTriggerConfig = {
    key: 'cx-vtu-article',
    sections: [
      { kind: 'scalar', fallbackData: { type: 'md', content: '' }, skeletonFields: ['content'] },
    ],
    frameStride: 10, // 树级模式不生效（统一节流取 opts），声明仅验证不报错
  }

  it('key 检出即挂载空壳：fallback ??= 补值 + 缺席骨架字段注入 _cx_streaming', () => {
    const trigger = compileTreeTrigger([articleConfig])
    const built = asNode(trigger.buildPartial({ key: 'cx-vtu-article' }, new Map()))
    expect(built?.data).toEqual({
      type: 'md',
      content: '',
      _cx_streaming: ['content'],
    })
  })

  it('已传输字段不被 fallback 覆盖；骨架字段完整到达后标记移除', () => {
    const trigger = compileTreeTrigger([articleConfig])
    const built = asNode(
      trigger.buildPartial(
        { key: 'cx-vtu-article', data: { type: 'md', content: '# 标题' } },
        new Map(),
      ),
    )
    expect(built?.data).toEqual({ type: 'md', content: '# 标题' })
  })

  it('嵌套在页面树 slot 内的 scalar 物料同样应用骨架语义', () => {
    const trigger = compileTreeTrigger([articleConfig])
    const spec: CxSpec = {
      id: 'root',
      key: 'cx-page-main',
      components: { default: [{ id: 'a1', key: 'cx-vtu-article' }] },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    const article = (built?.components as Record<string, CxStreamNode[]>)?.default?.[0]
    expect(article?.data?._cx_streaming).toEqual(['content'])
  })
})

describe('compileTreeTrigger 无 config 节点', () => {
  it('嵌套树仅做 prune：key 未闭合的半节点剔除、闭合节点保留', () => {
    const trigger = compileTreeTrigger([])
    const spec: CxSpec = {
      id: 'root',
      key: 'cx-page-main',
      components: {
        default: [
          { id: 'a', key: 'cx-header-bar' },
          { id: 'b' } as CxStreamNode, // id 闭合、key 未传的合法前缀产物
        ],
      },
    }
    const built = asNode(trigger.buildPartial(spec, new Map()))
    expect(built).not.toBeNull()
    const nodes = collectAllNodes(built!)
    expect(nodes.every((n) => typeof n.key === 'string')).toBe(true)
    expect(nodes.map((n) => n.id)).toEqual(['root', 'a'])
  })

  it('整树无完整节点时返回 null（管线保持 lastValid）', () => {
    const trigger = compileTreeTrigger([])
    expect(trigger.buildPartial({ id: 'x' } as CxStreamNode, new Map())).toBeNull()
  })
})
