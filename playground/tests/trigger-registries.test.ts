import { describe, expect, it } from 'vitest'
import {
  createIncrementalExtractor,
  matchCxTrigger,
  type ArraySectionConfig,
  type CxSpec,
  type CxStreamNode,
  type StreamTriggerConfig,
} from '@lionad/cx-stream'
import {
  COMPONENTS_STREAM_TRIGGERS,
  createComponentsTriggerRegistry,
} from '@lionad/cx-comps'
import {
  CxVtu,
  createVtuTriggerRegistry,
  mainArrayOf,
  VTU_STREAM_TRIGGERS,
} from '@lionad/cx-comps-vtu'
import {
  createNuxtUiV4TriggerRegistry,
  CxNuxtUIV4,
  mainArrayOf as mainArrayOfV4,
  NUXT_UI_V4_STREAM_TRIGGERS,
} from '@lionad/cx-comps-nuxt-ui-v4'
import { buildDefaultData, type CxMeta } from '../app/dev/material-utils'

// 物料库 trigger 注册表的判定型验收（与页面/定时器解耦的无头契约）：
// - YES 判定（数组增长型）：每个 config 的 key 都在注册表内，且前缀播放时
//   增量帧「出现 → 项数单调递增 → 终态收敛到完整行数」
// - NO 判定（标量/容器/表单控件/交互浮层）：key 不进注册表
//
// 剧本数据取自物料真实定义（_cx_meta.props 的 initial，与页面卡片回放
// 同一条 buildDefaultData 数据路径），主数组以真实数组循环扩充到 4 项——
// 真实字段形状使 arrayKey 与物料 data 字段名错配时测试直接失败（自造
// 样本会让参数化收敛对 arrayKey 同义反复，错配静默退化为一次性渲染），
// 循环扩充保证所有配置都有可观察的渐进窗口（部分物料 initial 仅 1-2 项）。

const REAL_ROWS = 4

/** 物料 meta 索引（key → meta），供各库 config 按 key 取真实样本 */
function metaIndex(materials: unknown): Map<string, CxMeta> {
  const index = new Map<string, CxMeta>()
  for (const comp of materials as { _cx_meta: CxMeta }[]) {
    index.set(comp._cx_meta.key, comp._cx_meta)
  }
  return index
}

const vtuMeta = metaIndex(CxVtu)
const v4Meta = metaIndex(CxNuxtUIV4)

/** 取配置中的数组形态段；region-only 配置返回 null（参数化收敛测试跳过） */
function arraySectionOf(config: StreamTriggerConfig): ArraySectionConfig | null {
  return config.sections.find((s): s is ArraySectionConfig => s.kind === 'array') ?? null
}

/**
 * 从物料真实定义构造剧本 data：buildDefaultData 取全部 props 初值，
 * 主数组替换为真实数组的循环扩充。字段名错配（arrayKey 笔误/物料改名）
 * 在此即失败，而非静默生成空数组。
 */
function realDataOf(meta: CxMeta, arrayKey: string): Record<string, unknown> {
  const data = buildDefaultData(meta)
  const arr = data[arrayKey]
  // throw 守卫（而非 expect 断言）使 TS 对 arr 的数组收窄在下方生效
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`${meta.key} 应有非空数组字段 ${arrayKey}`)
  }
  data[arrayKey] = Array.from({ length: REAL_ROWS }, (_, i) => arr[i % arr.length])
  return data
}

function scriptOf(key: string, data: Record<string, unknown>): string {
  const node: CxStreamNode = { id: `test-${key}`, key, data }
  return JSON.stringify(node, null, 2)
}

/**
 * 收敛契约：按约 40 个采样点播放脚本前缀，收集增量帧主数组长度——
 * 必须出现过增量帧、首帧少于完整行数（渐进而非一次到位）、单调递增、
 * 完整脚本收敛到 REAL_ROWS。
 */
function expectConverges(
  registryFactory: () => ReturnType<typeof createVtuTriggerRegistry>,
  countOf: (node: CxStreamNode) => number | null,
  key: string,
  data: Record<string, unknown>,
) {
  const script = scriptOf(key, data)
  const extractor = createIncrementalExtractor<CxSpec>({
    registry: registryFactory(),
    matchTrigger: matchCxTrigger,
  })
  const counts: number[] = []
  const step = Math.max(1, Math.floor(script.length / 40))
  for (let i = step; i < script.length; i += step) {
    const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
    if (partial) counts.push(countOf(partial) ?? 0)
  }
  const final = extractor.next(script) as CxStreamNode | null
  expect(final?.key).toBe(key)
  expect(countOf(final!)).toBe(REAL_ROWS)
  expect(counts.length, `${key} 应有可观察的增量窗口`).toBeGreaterThan(0)
  expect(counts[0], `${key} 首帧应少于完整行数`).toBeLessThan(REAL_ROWS)
  for (let i = 1; i < counts.length; i++) {
    expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
  }
}

const vtuCount = (node: CxStreamNode) => mainArrayOf(node)?.length ?? null

describe('vtu trigger 判定 · 数组增长型收敛', () => {
  it('注册表恰好覆盖全部判定适用的配置，无遗漏无冗余', () => {
    const registry = createVtuTriggerRegistry()
    expect(registry.size).toBe(VTU_STREAM_TRIGGERS.length)
    for (const config of VTU_STREAM_TRIGGERS) {
      expect(registry.has(config.key), `${config.key} 应在注册表内`).toBe(true)
    }
  })

  it.each(
    VTU_STREAM_TRIGGERS.flatMap((c) => {
      const array = arraySectionOf(c)
      return array ? [[c.key, c, array.arrayKey] as const] : []
    }),
  )('%s 真实样本前缀播放增量收敛', (_key, config, arrayKey) => {
    const meta = vtuMeta.get(config.key)
    expect(meta, `${config.key} 物料定义应存在`).toBeTruthy()
    expectConverges(createVtuTriggerRegistry, vtuCount, config.key, realDataOf(meta!, arrayKey))
  })

  it('判定不适用的 14 件物料不进注册表', () => {
    const registry = createVtuTriggerRegistry()
    // 社媒贴文（单体对象）/ 代码三件 / 标量媒体五件 / message-draft / approval-card
    const notApplicable = [
      'cx-vtu-terminal',
      'cx-vtu-code-block',
      'cx-vtu-code-diff',
      'cx-vtu-audio',
      'cx-vtu-image',
      'cx-vtu-video',
      'cx-vtu-citation',
      'cx-vtu-contact-card',
      'cx-vtu-instagram-post',
      'cx-vtu-linkedin-post',
      'cx-vtu-x-post',
      'cx-vtu-link-preview',
      'cx-vtu-message-draft',
      'cx-vtu-approval-card',
    ]
    for (const key of notApplicable) {
      expect(registry.has(key), `${key} 判定不适用，不应注册`).toBe(false)
    }
    // 29 件物料 = 15 适用（14 数组增长型 + article 标量主体）+ 14 不适用，判定完备无遗漏
    expect(VTU_STREAM_TRIGGERS.length + notApplicable.length).toBe(29)
  })
})

const v4Count = (node: CxStreamNode) => mainArrayOfV4(node)?.length ?? null

describe('nuxt-ui-v4 trigger 判定 · 数组增长型收敛', () => {
  it('tracer：table 增量收敛且尾随列定义缺席时从首行键推导', () => {
    const config = NUXT_UI_V4_STREAM_TRIGGERS.find((c) => c.key === 'cx-nuxt-ui-v4-table')
    expect(config, 'table 应判定为数组增长型').toBeTruthy()

    // 物料定义中 data 排在 columns 之前：行数据流式期间列定义尚未传输，
    // 与 chart 的 xKey/series 同一尾随场景，需从首行键推导兜底
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const partialJson = [
      '{',
      '  "id": "t1",',
      '  "key": "cx-nuxt-ui-v4-table",',
      '  "data": {',
      '    "data": [',
      '      { "name": "张三", "role": "管理员" },',
      '      { "name": "李四", "role": "成员" }',
    ].join('\n')
    const partial = extractor.next(partialJson) as CxStreamNode | null
    expect(partial?.key).toBe('cx-nuxt-ui-v4-table')
    const data = partial?.data as { data: unknown[]; columns?: unknown[] }
    expect(data.data).toHaveLength(2)
    expect(data.columns).toEqual([
      { accessorKey: 'name', header: 'name' },
      { accessorKey: 'role', header: 'role' },
    ])
  })

  it('真实列定义已传输时推导不覆盖', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const script = JSON.stringify(
      {
        id: 't2',
        key: 'cx-nuxt-ui-v4-table',
        data: {
          data: [
            { name: 'Alice', role: '管理员' },
            { name: 'Bob', role: '成员' },
          ],
          columns: [{ accessorKey: 'name', header: '姓名' }],
        },
      },
      null,
      2,
    )
    const final = extractor.next(script) as CxStreamNode | null
    const data = final?.data as { columns?: unknown[] }
    expect(data.columns).toEqual([{ accessorKey: 'name', header: '姓名' }])
  })

  it('注册表恰好覆盖全部判定适用的配置，无遗漏无冗余', () => {
    const registry = createNuxtUiV4TriggerRegistry()
    expect(registry.size).toBe(NUXT_UI_V4_STREAM_TRIGGERS.length)
    for (const config of NUXT_UI_V4_STREAM_TRIGGERS) {
      expect(registry.has(config.key), `${config.key} 应在注册表内`).toBe(true)
    }
  })

  it.each(
    NUXT_UI_V4_STREAM_TRIGGERS.flatMap((c) => {
      const array = arraySectionOf(c)
      return array ? [[c.key, c, array.arrayKey] as const] : []
    }),
  )('%s 真实样本前缀播放增量收敛', (_key, config, arrayKey) => {
    const meta = v4Meta.get(config.key)
    expect(meta, `${config.key} 物料定义应存在`).toBeTruthy()
    expectConverges(createNuxtUiV4TriggerRegistry, v4Count, config.key, realDataOf(meta!, arrayKey))
  })

  it('判定不适用的物料不进注册表（表单控件/交互浮层/页面骨架/标量采样）', () => {
    const registry = createNuxtUiV4TriggerRegistry()
    const notApplicable = [
      // 有数组字段但判定不适用：选项属表单控件 / 浮层 / 页面骨架
      'cx-nuxt-ui-v4-checkbox-group',
      'cx-nuxt-ui-v4-input-tags',
      'cx-nuxt-ui-v4-listbox',
      'cx-nuxt-ui-v4-dropdown-menu',
      'cx-nuxt-ui-v4-context-menu',
      'cx-nuxt-ui-v4-command-palette',
      'cx-nuxt-ui-v4-navigation-menu',
      // 标量/槽容器采样
      'cx-nuxt-ui-v4-button',
      'cx-nuxt-ui-v4-input',
      'cx-nuxt-ui-v4-modal',
      'cx-nuxt-ui-v4-avatar-group',
      'cx-nuxt-ui-v4-marquee',
    ]
    for (const key of notApplicable) {
      expect(registry.has(key), `${key} 判定不适用，不应注册`).toBe(false)
    }
  })
})

describe('nuxt-ui-v4 region 形态 · 多区容器区域揭示', () => {
  const REGION_KEYS = [
    'cx-nuxt-ui-v4-card',
    'cx-nuxt-ui-v4-footer',
    'cx-nuxt-ui-v4-header',
    'cx-nuxt-ui-v4-sidebar',
  ]

  it('4 件多区容器与 footer-columns 组合件全部进注册表', () => {
    const registry = createNuxtUiV4TriggerRegistry()
    for (const key of [...REGION_KEYS, 'cx-nuxt-ui-v4-footer-columns']) {
      expect(registry.has(key), `${key} 应注册 region 或组合形态 trigger`).toBe(true)
    }
  })

  it('card 前缀播放：区域按序列化序渐次揭示，footer 未闭合不渲染', () => {
    const script = JSON.stringify({
      id: 'card1',
      key: 'cx-nuxt-ui-v4-card',
      data: { title: '周报' },
      components: {
        header: [{ key: 'cx-text', data: { content: '头部' } }],
        default: [{ key: 'cx-text', data: { content: '正文' } }],
        footer: [{ key: 'cx-text', data: { content: '底部' } }],
      },
    })
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })

    const slotSets: string[][] = []
    const step = Math.max(1, Math.floor(script.length / 30))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      const components = partial?.components
      if (components && !Array.isArray(components)) slotSets.push(Object.keys(components))
    }
    const final = extractor.next(script) as CxStreamNode | null

    // 存在 header 已揭示而 footer 未闭合缺席的中间帧（区域独立可判）
    expect(
      slotSets.some(
        (slots) => slots.includes('header') && !slots.includes('footer'),
      ),
      '应存在 header 揭示且 footer 缺席的中间帧',
    ).toBe(true)
    // 终帧三区齐
    const finalComponents = final?.components as Record<string, unknown[]>
    expect(Object.keys(finalComponents)).toEqual(['header', 'default', 'footer'])
    expect(final?.data?.title).toBe('周报')
  })

  it('footer-columns 组合形态：columns 数组与 left/right 区域各自渐进', () => {
    const script = JSON.stringify({
      id: 'fc1',
      key: 'cx-nuxt-ui-v4-footer-columns',
      data: {
        columns: [
          { label: '产品', children: [{ label: '组件文档', to: '/docs' }] },
          { label: '社区', children: [{ label: 'GitHub', to: 'https://github.com' }] },
        ],
      },
      components: {
        left: [{ key: 'cx-text', data: { content: '左区' } }],
        right: [{ key: 'cx-text', data: { content: '右区' } }],
      },
    })
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })

    const columnCounts: number[] = []
    const step = Math.max(1, Math.floor(script.length / 40))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      const columns = partial?.data?.columns
      if (Array.isArray(columns)) columnCounts.push(columns.length)
    }
    const final = extractor.next(script) as CxStreamNode | null

    expect(columnCounts.length, '应有可观察的列增量窗口').toBeGreaterThan(0)
    expect(columnCounts[0]).toBeLessThan(2)
    expect((final?.data?.columns as unknown[]).length).toBe(2)
    const finalComponents = final?.components as Record<string, unknown[]>
    expect(Object.keys(finalComponents)).toEqual(['left', 'right'])
  })

  it('table 空态透传：data:[] 闭合帧产出 partial 而非 lastValid 保持', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const partial = extractor.next(
      JSON.stringify({ id: 't3', key: 'cx-nuxt-ui-v4-table', data: { data: [] } }),
    ) as CxStreamNode | null

    expect(partial, '空表闭合应透传节点由 table 内置 empty slot 接管').not.toBeNull()
    expect(partial?.data?.data).toEqual([])
  })
})

describe('内置 components trigger 判定 · 零数组增长型物料', () => {
  it('全部 22 件物料判定不适用：注册表为空且工厂可调用', () => {
    expect(COMPONENTS_STREAM_TRIGGERS).toEqual([])
    const registry = createComponentsTriggerRegistry()
    expect(registry.size).toBe(0)

    // 判定依据逐件成立：文本/标题 7 件为标量 content；figure 为单图；
    // block/scrollbar/page/grid 为容器槽（子组件在 components 而非 data 数组）；
    // logic/datas/action/toast/state/computed/navigate/skeleton 为 headless 逻辑物料；
    // calendar props 全部注释（无 data）；user-style 为单条 CSS 字符串
    const allKeys = [
      'cx-text',
      'cx-header',
      'cx-h1',
      'cx-h2',
      'cx-h3',
      'cx-h4',
      'cx-h5',
      'cx-block',
      'cx-figure',
      'cx-logic',
      'cx-datas',
      'cx-action',
      'cx-toast',
      'cx-state',
      'cx-computed',
      'cx-navigate',
      'cx-scrollbar',
      'cx-skeleton',
      'cx-calendar',
      'cx-grid',
      'cx-page',
      'cx-user-style',
    ]
    for (const key of allKeys) {
      expect(registry.has(key), `${key} 判定不适用`).toBe(false)
    }
    expect(allKeys).toHaveLength(22)
  })
})
