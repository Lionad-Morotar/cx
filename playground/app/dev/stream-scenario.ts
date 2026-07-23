import { createTriggerRegistry } from '@lionad/cx-stream'
import type { CxSpec, CxStreamNode, MatchesPerPath, TriggerRegistry } from '@lionad/cx-stream'
import type { CxComponentRuntime } from '@lionad/cx-definition'

// /dev/stream 验收页的确定性剧本与 cx 协议装配。
// 抽成独立模块（而非内联进页面）有两个原因：
// 1. 无头测试可直接驱动这些纯数据/纯函数，不必挂载 Nuxt 页面与定时器；
// 2. 页面 setup 只保留回放引擎与面板渲染，控制在可读行数内。

/**
 * LLM 最终要完整输出的 data-table Spec（剧本单一事实源）。
 *
 * 选用 cx-vtu-data-table 承载「大数组渐进渲染」：其行数据属性名为 `data`
 * （注意不是源包 readme 示例里的 rows——前身到当前的类型漂移），
 * 因此增量 trigger 的扫描路径见 createDemoRegistry。
 */
export const DEMO_TABLE_SPEC: CxStreamNode = {
  id: 'stream-demo-table',
  key: 'cx-vtu-data-table',
  name: '团队成员',
  data: {
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'role', label: '角色' },
      { key: 'active', label: '启用', format: { kind: 'boolean' } },
    ],
    data: [
      { name: 'Alice', role: '管理员', active: true },
      { name: 'Bob', role: '成员', active: false },
      { name: 'Carol', role: '成员', active: true },
      { name: 'Dave', role: '访客', active: false },
    ],
  },
}

// JSON.stringify 的 2 空格缩进让每个数组元素独占一行，
// 流式回放时行数据「逐行到达」，增量渲染的渐进效果才肉眼可见。
const specJson = JSON.stringify(DEMO_TABLE_SPEC, null, 2)

/**
 * 预置的 LLM 流式输出剧本：散文 + ```json 围栏 Spec + 收尾散文。
 * 页面回放引擎按字符把它喂进一根不断生长的字符串。
 */
export const STREAM_SCRIPT = [
  '好的，我把团队成员信息整理成了一张表格：',
  '',
  '```json',
  specJson,
  '```',
  '',
  '如上所示，共 4 位成员，多数处于启用状态。',
].join('\n')

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
