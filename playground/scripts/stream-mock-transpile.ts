/**
 * Coze root/elements 方言 → cx 协议的转译器（纯函数，脚本与测试共用）
 *
 * Why 存在：vendored Coze SSE 录制里 ```json 围栏使用
 * `{ root, elements: { [id]: { type, props } } }` 方言，与 cx 协议的
 * `{ id, key, data }` 不同构，detector 的首字段快速识别约定（id/key）不匹配。
 * 转译放生成时而非运行时，playground 运行侧不携带方言知识。
 */

/** Coze 围栏方言的 spec 结构 */
export interface CozeFenceSpec {
  root: string
  elements: Record<
    string,
    {
      type: string
      role?: string
      props?: Record<string, unknown>
    }
  >
}

/** 与 CxStreamNode 同构的最小结构；本地声明以免生成脚本依赖包构建产物 */
export interface TranspiledNode {
  id?: string
  key: string
  data?: Record<string, unknown>
}

/** Coze 组件 type → cx 组件 key */
const TYPE_TO_KEY: Record<string, string> = {
  DataTable: 'cx-vtu-data-table',
  Chart: 'cx-vtu-chart',
  GeoMap: 'cx-vtu-geo-map',
  OptionList: 'cx-vtu-option-list',
  ImageGallery: 'cx-vtu-image-gallery',
  StatsDisplay: 'cx-vtu-stats-display',
}

/**
 * Chart 的契约缺口推导：Coze props 没有 cx 要求的 xKey/series，
 * 从 data 首行字段推导——首字段作 xKey，其余字段作 series。
 */
function deriveChartFields(data: Record<string, unknown>): void {
  const rows = data.data
  if (!Array.isArray(rows) || rows.length === 0 || data.xKey) return
  const keys = Object.keys(rows[0] as Record<string, unknown>)
  data.xKey = keys[0]
  data.series ??= keys.slice(1).map((k) => ({ key: k, label: k }))
}

/**
 * 单个 Coze 围栏 spec → TranspiledNode。
 * id 放首字段：满足 cxSpecDetectorConfig「对象首个字段为 id 或 key」的
 * 流式初期快速识别约定。props 里的 id 下沉为节点 id，其余字段平移为 data。
 */
export function transpileCozeSpec(spec: CozeFenceSpec): TranspiledNode {
  const el = spec.elements?.[spec.root]
  if (!el) throw new Error(`root "${spec.root}" not found in elements`)
  const key = TYPE_TO_KEY[el.type]
  if (!key) throw new Error(`unknown Coze element type: ${el.type}`)
  const { id: propsId, ...data } = structuredClone(el.props ?? {}) as Record<string, unknown>
  if (el.type === 'Chart') deriveChartFields(data)
  return { id: (propsId as string | undefined) ?? spec.root, key, data }
}

export interface TranspileStreamResult {
  /** 转译重组后的完整剧本（散文保留，围栏替换为 cx 协议 JSON） */
  script: string
  /** 按原 delta 边界（比例映射到新坐标）切片 */
  chunks: string[]
  componentKeys: string[]
  fenceCount: number
}

/** 匹配 ```json ... ``` 围栏；match 区间含围栏标记本身 */
const FENCE_RE = /```json\n([\s\S]*?)```/g

interface FenceMapping {
  oldStart: number
  oldEnd: number
  newStart: number
  newEnd: number
}

/**
 * 整段 Coze 输出内容的转译 + 边界映射。
 *
 * boundaries 是原 content 坐标系下每个 delta 结束位置的累积偏移（不含末尾）。
 * 转译改变围栏内文本长度后，边界映射规则：
 * - 散文区：按已处理围栏的长度差平移
 * - 围栏内：按 (offset-start)/(end-start) 比例映射到转译后区间
 * chunk 边界本就允许落在 JSON 中间（流式的真实感来源），比例映射足够。
 */
export function transpileStream(content: string, boundaries: number[]): TranspileStreamResult {
  const fences = [...content.matchAll(FENCE_RE)]
  if (fences.length === 0) throw new Error('no ```json fence found in content')

  const componentKeys: string[] = []
  const mappings: FenceMapping[] = []
  let script = ''
  let cursor = 0

  for (const m of fences) {
    const oldStart = m.index
    const oldEnd = oldStart + m[0].length
    const node = transpileCozeSpec(JSON.parse((m[1] as string).trim()))
    componentKeys.push(node.key)
    const replacement = '```json\n' + JSON.stringify(node, null, 2) + '\n```'
    const newStart = script.length + (oldStart - cursor)
    script += content.slice(cursor, oldStart) + replacement
    mappings.push({ oldStart, oldEnd, newStart, newEnd: newStart + replacement.length })
    cursor = oldEnd
  }
  script += content.slice(cursor)

  const newBoundaries: number[] = []
  for (const b of boundaries) {
    const inside = mappings.find((f) => b > f.oldStart && b < f.oldEnd)
    let nb: number
    if (inside) {
      const ratio = (b - inside.oldStart) / (inside.oldEnd - inside.oldStart)
      nb = inside.newStart + Math.round(ratio * (inside.newEnd - inside.newStart))
    } else {
      const shift = mappings
        .filter((f) => f.oldEnd <= b)
        .reduce((acc, f) => acc + (f.newEnd - f.newStart) - (f.oldEnd - f.oldStart), 0)
      nb = b + shift
    }
    if (nb > 0 && nb < script.length) newBoundaries.push(nb)
  }
  newBoundaries.sort((a, b) => a - b)

  const chunks: string[] = []
  let prev = 0
  for (const nb of newBoundaries) {
    if (nb === prev) continue // 比例取整撞点时去重，避免空 chunk
    chunks.push(script.slice(prev, nb))
    prev = nb
  }
  chunks.push(script.slice(prev))

  return { script, chunks, componentKeys, fenceCount: fences.length }
}
