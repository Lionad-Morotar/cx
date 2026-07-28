import { createTriggerRegistry } from '@lionad/cx-stream'
import type {
  CxSpec,
  CxStreamNode,
  IncrementalTrigger,
  MatchesPerPath,
  ScanPath,
  TriggerRegistry,
} from '@lionad/cx-stream'
import type { CxComponentRuntime } from '@lionad/cx-definition'

import { compositeChunks, compositeMeta } from './stream-mock.generated'

// /dev/stream 验收页的确定性剧本与 cx 协议装配。
// 抽成独立模块（而非内联进页面）有两个原因：
// 1. 无头测试可直接驱动这些纯数据/纯函数，不必挂载 Nuxt 页面与定时器；
// 2. 页面 setup 只保留回放引擎与面板渲染，控制在可读行数内。

/**
 * 流式剧本的 chunk 序列：Coze 录制转译产物（见 stream-mock.generated.ts），
 * 边界对应真实 SSE delta 的心跳节奏。按 chunk 粒度推进回放时，
 * 管线调用次数从「字符数/步长」降到「delta 数」。
 */
export const STREAM_CHUNKS: string[] = compositeChunks

/**
 * 字符串契约的完整剧本。
 * detector / 增量管线等字符串消费者不需要感知 chunk 边界，统一消费这一根。
 */
export const STREAM_SCRIPT = STREAM_CHUNKS.join('')

/** 剧本组件数上限（composite 剧本的围栏总数） */
export const MAX_COMPONENTS = compositeMeta.fenceCount

/**
 * 把剧本裁到前 n 个组件围栏：剧本在第 n 个围栏闭合处结束，其后的散文与
 * 围栏不再出现（散文引用不存在的组件会造成语义断裂）。返回的 chunks 保持
 * 原 delta 边界，仅末 chunk 可能被截短；n 达到围栏总数时返回完整剧本，
 * 保留结尾散文。
 */
export function cropScenarioChunks(n: number): string[] {
  const end = compositeMeta.fenceEndOffsets[n - 1]
  if (end === undefined || n >= MAX_COMPONENTS) return compositeChunks
  const out: string[] = []
  let acc = 0
  for (const chunk of compositeChunks) {
    if (acc + chunk.length <= end) {
      out.push(chunk)
      acc += chunk.length
      continue
    }
    const rest = end - acc
    if (rest > 0) out.push(chunk.slice(0, rest))
    break
  }
  return out
}

// --- 增量渲染 trigger（Route Z）---

/**
 * 数组增长型组件的增量配置。
 * 六类 vtu 物料的核心数据都是 data 下的一个数组（行/数据点/图片/指标/标记/选项），
 * 增量语义同构：截断到「括号已平衡」的完整元素，残缺尾部由 jsonrepair 补全的不纳入。
 */
interface ArrayTriggerConfig {
  key: string
  /** data 下流式增长的主数组字段名 */
  arrayKey: string
  /** 主数组之外的补充扫描路径（次增长数组：列定义/系列/路线/操作按钮） */
  extraScanPaths?: ScanPath[]
  /**
   * 必需字段序列化在主数组之后时的推导兜底。
   * chart 的 xKey/series 排在数据数组之后，数据点流式期间缺席，
   * 与生成侧转译器同一推导语义补齐（真实字段已传输则不覆盖）。
   */
  deriveTailFields?: (completeRows: unknown[]) => Record<string, unknown>
}

function pickNode(spec: CxSpec, key: string): CxStreamNode | null {
  const nodes = Array.isArray(spec) ? spec : [spec]
  return nodes.find((node) => node.key === key) ?? null
}

/** 与生成侧转译器同一语义：首字段作 xKey，其余字段作 series */
function deriveChartTailFields(completeRows: unknown[]): Record<string, unknown> {
  const first = completeRows[0]
  if (!first || typeof first !== 'object') return {}
  const keys = Object.keys(first as Record<string, unknown>)
  return {
    xKey: keys[0],
    series: keys.slice(1).map((k) => ({ key: k, label: k })),
  }
}

/**
 * 数组增长型 trigger 工厂：buildPartial 从已修复解析的前缀里只取「括号已平衡」
 * 的完整元素，截断点之后被 jsonrepair 补全的残缺元素不纳入，保证渲染出的每一
 * 项都是完整数据。无完整元素时返回 null，交由管线的 lastValid 维持上一帧
 * （渲染端不闪没）。
 */
function makeArrayTrigger(config: ArrayTriggerConfig): IncrementalTrigger<CxSpec> {
  const mainPath: ScanPath = ['data', config.arrayKey, '*']
  return {
    scanPaths: [mainPath, ...(config.extraScanPaths ?? [])],
    buildPartial: (spec: CxSpec, matchesPerPath: MatchesPerPath): CxSpec | null => {
      const node = pickNode(spec, config.key)
      if (!node) return null

      const complete = matchesPerPath.get(JSON.stringify(mainPath))?.length ?? 0
      if (complete === 0) return null

      const rows = (node.data?.[config.arrayKey] as unknown[] | undefined) ?? []
      const data: Record<string, unknown> = {
        ...node.data,
        [config.arrayKey]: rows.slice(0, complete),
      }
      if (config.deriveTailFields) {
        for (const [k, v] of Object.entries(config.deriveTailFields(rows.slice(0, complete)))) {
          data[k] ??= v
        }
      }
      // 每次返回全新对象/数组引用，供渲染端检测变化触发重渲染
      return { ...node, data }
    },
  }
}

const ARRAY_TRIGGERS: ArrayTriggerConfig[] = [
  { key: 'cx-vtu-data-table', arrayKey: 'data', extraScanPaths: [['data', 'columns', '*']] },
  {
    key: 'cx-vtu-chart',
    arrayKey: 'data',
    extraScanPaths: [['data', 'series', '*']],
    deriveTailFields: deriveChartTailFields,
  },
  { key: 'cx-vtu-image-gallery', arrayKey: 'images' },
  { key: 'cx-vtu-stats-display', arrayKey: 'stats' },
  { key: 'cx-vtu-geo-map', arrayKey: 'markers', extraScanPaths: [['data', 'routes', '*']] },
  { key: 'cx-vtu-option-list', arrayKey: 'options', extraScanPaths: [['data', 'actions', '*']] },
]

/**
 * 装配 demo 用的 trigger 注册表；工厂创建，实例间互不污染。
 * 全部六类物料都注册：多围栏剧本下任一围栏流式时增量面板都能展示
 * 当前组件的增量状态，而非冻结在首个组件的 lastValid 帧。
 */
export function createDemoRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of ARRAY_TRIGGERS) {
    registry.register(config.key, makeArrayTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = ARRAY_TRIGGERS.find((c) => c.key === node.key)
  if (!config) return null
  const arr = node.data?.[config.arrayKey]
  return Array.isArray(arr) ? arr : null
}

// --- CxStreamNode → CxRender 节点适配 ---

/**
 * 把流式管线的 CxStreamNode 规整为 CxRender 可消费的最小运行时节点。
 * CxRender 只需 id/key/data（props 由 data 展开绑定）；流式节点的 id 可缺省，
 * 此处回填稳定 id，使增量帧与终态帧落在同一组件实例上原地更新而非重建。
 */
export function toRenderNode(spec: CxStreamNode): CxComponentRuntime {
  return {
    id: spec.id ?? 'stream-node',
    key: spec.key,
    name: spec.name ?? spec.key,
    data: spec.data ?? {},
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {},
  } as CxComponentRuntime
}
