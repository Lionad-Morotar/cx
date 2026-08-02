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
import {
  createEpTriggerRegistry,
  CxElementPlus,
  EP_STREAM_TRIGGERS,
  mainArrayOf as mainArrayOfEp,
} from '@lionad/cx-comps-element-plus'
import { buildDefaultData, type CxMeta } from '../app/dev/material-utils'

// 物料库 trigger 注册表的判定型验收（与页面/定时器解耦的无头契约）：
// - vtu：29 件全适用——数组增长型 14 件前缀播放「出现 → 项数单调递增 →
//   终态收敛完整行数」；标量主体形态 15 件（article + 长主体 7 + 短属性 7）
//   属性闭合切分，包内 e2e 覆盖，此层断言注册完备性
// - nuxt-ui-v4：19 件判定适用——数组增长型 8 + 多区容器 region 4 + 组合 1 +
//   标量主体 6（alert/avatar/banner/empty/error/user，属性闭合切分，包内单测
//   覆盖）；51 件不适用（交互控件/浮层/导航 chrome/装饰/数值/槽容器/展示容器）
// - components：标量主体形态 9 件适用（文本/标题 7 + user-style + figure，
//   属性闭合切分，包内单测覆盖），13 件维持不适用（容器槽/headless/无 data）
// - element-plus：10 件判定适用——数组增长型 5（table 叠加列定义次增长路径 +
//   timeline/steps/breadcrumb/descriptions）+ 多区容器 region 1（card）+
//   标量主体 4（alert/result/empty/avatar，属性闭合切分，包内单测覆盖）；
//   17 件不适用（交互控件 10/极短标记 3/宿主标记 1/数值状态 2/单槽布局壳 1）
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
const epMeta = metaIndex(CxElementPlus)

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

  it('29 件物料全部注册：14 数组增长型 + 15 标量主体形态，判定完备无遗漏', () => {
    const registry = createVtuTriggerRegistry()
    // 标量主体形态 15 件：article 首例 + 长主体 7 件（社媒贴文/代码三件/
    // message-draft，空壳挂载 + 骨架占位）+ 短属性 7 件（媒体/引用/联系卡/
    // 链接预览/审批卡，空壳挂载 + 属性揭示）
    const scalarKeys = [
      'cx-vtu-article',
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
    for (const key of scalarKeys) {
      expect(registry.has(key), `${key} 标量主体形态应注册`).toBe(true)
    }
    const arrayCount = VTU_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'array'),
    ).length
    expect(arrayCount).toBe(14)
    expect(scalarKeys).toHaveLength(15)
    expect(VTU_STREAM_TRIGGERS.length).toBe(29)
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

  it('判定不适用的物料不进注册表（交互控件/浮层/导航/装饰容器采样）', () => {
    const registry = createNuxtUiV4TriggerRegistry()
    const notApplicable = [
      // 有数组字段但判定不适用：选项属交互控件 / 浮层 / 页面骨架
      'cx-nuxt-ui-v4-checkbox-group',
      'cx-nuxt-ui-v4-input-tags',
      'cx-nuxt-ui-v4-listbox',
      'cx-nuxt-ui-v4-dropdown-menu',
      'cx-nuxt-ui-v4-context-menu',
      'cx-nuxt-ui-v4-command-palette',
      'cx-nuxt-ui-v4-navigation-menu',
      // 交互控件 / 展示容器采样（button 动作触发、avatar-group/marquee 槽容器）
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

describe('nuxt-ui-v4 scalar 形态 · 属性闭合切分', () => {
  // 标量主体形态 6 件：答复内容型标量物料（alert/avatar/banner/empty/error/user），
  // 收益是空壳早挂载 + 属性闭合即揭示；包内 scalar-triggers.test.ts 逐件覆盖
  // 收录/编译/空壳/终态/挂载，此层锁定注册完备性与端到端代表件
  const SCALAR_KEYS = [
    'cx-nuxt-ui-v4-alert',
    'cx-nuxt-ui-v4-avatar',
    'cx-nuxt-ui-v4-banner',
    'cx-nuxt-ui-v4-empty',
    'cx-nuxt-ui-v4-error',
    'cx-nuxt-ui-v4-user',
  ]

  it('6 件 scalar 判定适用物料全部注册，注册表恰 19 件', () => {
    const registry = createNuxtUiV4TriggerRegistry()
    expect(registry.size).toBe(NUXT_UI_V4_STREAM_TRIGGERS.length)
    expect(NUXT_UI_V4_STREAM_TRIGGERS).toHaveLength(19)
    for (const key of SCALAR_KEYS) {
      expect(registry.has(key), `${key} 标量主体形态应注册`).toBe(true)
    }
  })

  it('alert 前缀播放：key 检出即空壳帧，fallback 保契约且无骨架标记', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const shell = extractor.next('{"key":"cx-nuxt-ui-v4-alert"') as CxStreamNode | null
    expect(shell).toMatchObject({
      key: 'cx-nuxt-ui-v4-alert',
      data: { title: '', description: '' },
    })
    expect((shell?.data ?? {})['_cx_streaming']).toBeUndefined()
  })

  it('alert 完整 JSON 终态帧全字段一致（终态兜底直出完整帧）', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createNuxtUiV4TriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const script = JSON.stringify({
      id: 'a1',
      key: 'cx-nuxt-ui-v4-alert',
      data: { title: '部署完成', description: 'v2.4 已上线', color: 'success' },
    })
    const final = extractor.next(script) as CxStreamNode | null
    expect(final, '终态兜底应直出完整帧').not.toBeNull()
    expect(final?.data).toMatchObject({
      title: '部署完成',
      description: 'v2.4 已上线',
      color: 'success',
    })
  })
})

describe('内置 components trigger 判定 · 标量主体形态 9 件', () => {
  it('9 件 scalar 适用物料全部注册，注册表无遗漏无冗余', () => {
    const registry = createComponentsTriggerRegistry()
    expect(registry.size).toBe(COMPONENTS_STREAM_TRIGGERS.length)
    // 标量主体形态 9 件：文本/标题 7 件（content 标量）+ user-style
    // （CSS 标量，闭合才注入）+ figure（image 对象，照 vtu image 先例）
    const scalarKeys = [
      'cx-text',
      'cx-header',
      'cx-h1',
      'cx-h2',
      'cx-h3',
      'cx-h4',
      'cx-h5',
      'cx-user-style',
      'cx-figure',
    ]
    expect(scalarKeys).toHaveLength(9)
    for (const key of scalarKeys) {
      expect(registry.has(key), `${key} 标量主体形态应注册`).toBe(true)
    }
  })

  it('13 件判定不适用不进注册表（容器槽/headless/无 data）', () => {
    // 判定依据逐件成立：容器 4 件增长的是槽内子组件（components 树）而非
    // data 数组；headless 逻辑物料 8 件无可见 UI；calendar props 全部注释
    const registry = createComponentsTriggerRegistry()
    const notApplicable = [
      'cx-block',
      'cx-scrollbar',
      'cx-page',
      'cx-grid',
      'cx-logic',
      'cx-datas',
      'cx-action',
      'cx-toast',
      'cx-state',
      'cx-computed',
      'cx-navigate',
      'cx-skeleton',
      'cx-calendar',
    ]
    expect(notApplicable).toHaveLength(13)
    for (const key of notApplicable) {
      expect(registry.has(key), `${key} 判定不适用，不应注册`).toBe(false)
    }
    // 9 适用 + 13 不适用 = 22 件物料判定完备
  })
})

const epCount = (node: CxStreamNode) => mainArrayOfEp(node)?.length ?? null

describe('element-plus trigger 判定 · 三形态 10 件', () => {
  it('注册表恰好覆盖全部判定适用的配置，10 件无遗漏无冗余', () => {
    const registry = createEpTriggerRegistry()
    expect(registry.size).toBe(EP_STREAM_TRIGGERS.length)
    expect(EP_STREAM_TRIGGERS).toHaveLength(10)
    for (const config of EP_STREAM_TRIGGERS) {
      expect(registry.has(config.key), `${config.key} 应在注册表内`).toBe(true)
    }
  })

  it.each(
    EP_STREAM_TRIGGERS.flatMap((c) => {
      const array = arraySectionOf(c)
      return array ? [[c.key, c, array.arrayKey] as const] : []
    }),
  )('%s 真实样本前缀播放增量收敛', (_key, config, arrayKey) => {
    const meta = epMeta.get(config.key)
    expect(meta, `${config.key} 物料定义应存在`).toBeTruthy()
    expectConverges(createEpTriggerRegistry, epCount, config.key, realDataOf(meta!, arrayKey))
  })

  it('table 列定义序列化序领先行数据：首行帧即携带全量列，尾随标量终帧兜底', () => {
    // EP table props 序为 columns 在前、data 在后：列定义先于行生长完整闭合，
    // 与 nuiv4 table（data 在前、列尾随需 deriveTailFields 首行键推导）形成
    // 对照——EP 无需推导，首帧起列定义即完整可用。
    // 截断窗口取在首行元素闭合点（紧凑序列化保证子串可定位）
    const meta = epMeta.get('cx-element-plus-table')!
    const data = realDataOf(meta, 'data')
    const columns = data.columns as unknown[]
    const script = JSON.stringify({ id: 't-ep-table', key: 'cx-element-plus-table', data })
    const firstRowJson = JSON.stringify((data.data as unknown[])[0])
    const firstRowEnd = script.indexOf(firstRowJson) + firstRowJson.length
    expect(firstRowEnd).toBeGreaterThan(firstRowJson.length)

    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createEpTriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const first = extractor.next(script.slice(0, firstRowEnd)) as CxStreamNode | null
    expect(first?.data?.data, '首行闭合即出帧').toHaveLength(1)
    expect(first?.data?.columns, '首帧即携带全量列定义').toHaveLength(columns.length)

    // data 之后的 border/stripe/size 尾随标量不入增量帧，终态完整帧兜底
    const final = extractor.next(script) as CxStreamNode | null
    expect(final?.data?.data).toHaveLength(REAL_ROWS)
    expect(final?.data?.columns).toHaveLength(columns.length)
    expect(final?.data?.border).toBe(true)
  })

  it('17 件判定不适用不进注册表，10 适用 + 17 不适用 = 27 件判定完备', () => {
    // 差集派生（而非采样列举）：物料增减时计数契约自动跟随，错配即败
    const registry = createEpTriggerRegistry()
    const notApplicable = CxElementPlus.map((x) => x._cx_meta.key as string).filter(
      (key) => !EP_STREAM_TRIGGERS.some((c) => c.key === key),
    )
    expect(notApplicable).toHaveLength(17)
    expect(CxElementPlus).toHaveLength(27)
    for (const key of notApplicable) {
      expect(registry.has(key), `${key} 判定不适用，不应注册`).toBe(false)
    }
  })

  it('alert 前缀播放：key 检出即空壳帧，fallback 保契约且无骨架标记', () => {
    // scalar 代表件端到端：空壳早挂载 + 属性闭合切分包内逐件覆盖
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createEpTriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const shell = extractor.next('{"key":"cx-element-plus-alert"') as CxStreamNode | null
    expect(shell).toMatchObject({
      key: 'cx-element-plus-alert',
      data: { title: '', description: '' },
    })
    expect((shell?.data ?? {})['_cx_streaming']).toBeUndefined()
  })

  it('card 缺槽剧本：default 闭合即揭示，终帧槽集 ⊆ 声明 slots', () => {
    // 缺槽是合法剧本：槽位未传不输岀该区，终帧槽集是声明 slots 的子集
    const script = JSON.stringify({
      id: 'c1',
      key: 'cx-element-plus-card',
      data: { shadow: 'hover' },
      components: {
        default: [{ key: 'cx-element-plus-tag', data: { text: '主体' } }],
      },
    })
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createEpTriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const final = extractor.next(script) as CxStreamNode | null
    const finalComponents = final?.components as Record<string, unknown[]>
    expect(Object.keys(finalComponents)).toEqual(['default'])
    const declared = Object.keys(
      (epMeta.get('cx-element-plus-card')!.slots ?? {}) as Record<string, unknown>,
    )
    for (const slot of Object.keys(finalComponents)) {
      expect(declared, `终帧槽 ${slot} 应在声明 slots 内`).toContain(slot)
    }
  })
})
