import { createTriggerRegistry } from '@lionad/cx-stream'
import type { CxSpec, CxStreamNode, MatchesPerPath, TriggerRegistry } from '@lionad/cx-stream'
import type { CxComponentRuntime } from '@lionad/cx-definition'

import { compositeChunks } from './stream-mock.generated'

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

// --- 增量渲染 trigger（Route Z）---

const DEMO_TABLE_KEY = 'cx-vtu-data-table'

/** data-table 行数据在组件 data 下的路径；注意属性名是 data 而非 rows */
const ROWS_SCAN_PATH = ['data', 'data', '*']
const COLUMNS_SCAN_PATH = ['data', 'columns', '*']

function pickTableNode(spec: CxSpec): CxStreamNode | null {
  const nodes = Array.isArray(spec) ? spec : [spec]
  return nodes.find((node) => node.key === DEMO_TABLE_KEY) ?? null
}

/**
 * data-table 的增量规则：从已修复解析的前缀里只取「括号已平衡」的完整行，
 * 截断点之后被 jsonrepair 补全的残缺行不纳入，保证渲染出的每一行都是完整数据。
 * 无完整行时返回 null，交由管线的 lastValid 维持上一帧（渲染端不闪没）。
 */
function buildTablePartial(spec: CxSpec, matchesPerPath: MatchesPerPath): CxSpec | null {
  const node = pickTableNode(spec)
  if (!node) return null

  const completeRows = matchesPerPath.get(JSON.stringify(ROWS_SCAN_PATH))?.length ?? 0
  if (completeRows === 0) return null

  const rows = (node.data?.data as unknown[] | undefined) ?? []
  // 每次返回全新对象/数组引用，供渲染端检测变化触发重渲染
  return { ...node, data: { ...node.data, data: rows.slice(0, completeRows) } }
}

/** 装配 demo 用的 trigger 注册表；工厂创建，实例间互不污染 */
export function createDemoRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  registry.register(DEMO_TABLE_KEY, {
    scanPaths: [COLUMNS_SCAN_PATH, ROWS_SCAN_PATH],
    buildPartial: buildTablePartial,
  })
  return registry
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
