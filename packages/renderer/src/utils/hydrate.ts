/**
 * hydrate — 把 LLM 产出的最小 CX 节点契约(CxSpec)水合为 cx-render 运行时树
 *
 * LLM 只产出 { key, data?, components? };cx-render 需 id/事件等运行时字段。本函数:
 * - 递归赋稳定 id(以 prefix 起头,供 host 侧 hooks 按前缀路由事件,同时解决流式 id 漂移)
 * - 向交互物料的 data 注入 _cx_events(id/key/subs 三必填——缺 subs 会在 cx-emitter
 *   广播链读 subs.forEach 抛 TypeError),使 getEmits ∩ _cx_events 非空、
 *   render-component 据此绑定 v-on(否则交互事件永不接线)
 * 事件键集从已安装物料 meta emits 推导(传入 cx 实例时),根治「宿主侧硬编码镜像表
 * 与物料 emits 重复维护必然腐化」;键集是全集而非精选——多接的事件(如 update:modelValue)
 * 由宿主语义分流层落 ignore,零副作用。无 loader 场景(编辑器等)退回显式事件表。
 */
import { createCxCompRuntime } from '@lionad/cx-definition'
import type { CxComponentRuntime, CxLoaderInstance } from '@lionad/cx-definition'
import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

export type HydrateCxSpecOptions = {
  /** cx loader 实例:从已安装物料 meta emits 推导需接线事件键集(优先于 events) */
  cx?: CxLoaderInstance
  /** 显式事件表(无 loader 场景,如编辑器):物料 key → emits 键数组 */
  events?: Record<string, string[]>
}

/**
 * 水合入口:单根或数组根(数组时逐个水合;CxRender 顶层只渲染首元素,
 * 提示词约束保证单根)。同 spec 同 prefix 的两次调用产出相同 id 序列。
 */
export function hydrateCxSpec(
  spec: CxSpec,
  prefix: string,
  options: HydrateCxSpecOptions = {},
): CxComponentRuntime[] {
  const resolveEventKeys = (key: string): string[] => {
    if (options.cx) return Object.keys(options.cx.utils.getEmits(key))
    return options.events?.[key] ?? []
  }

  const hydrateNode = (
    node: CxStreamNode,
    seq: { n: number },
    path: string,
  ): CxComponentRuntime => {
    const id = node.id || `${prefix}-${path || 'root'}-${seq.n++}`
    const children: Record<string, CxComponentRuntime[]> = {}
    if (node.components) {
      const groups = Array.isArray(node.components)
        ? { default: node.components }
        : node.components
      for (const [slot, arr] of Object.entries(groups)) {
        children[slot] = arr.map((c, i) =>
          hydrateNode(c, seq, `${path}${path ? '.' : ''}${slot}${i}`),
        )
      }
    }
    const data: Record<string, unknown> = { ...(node.data || {}) }
    const evKeys = resolveEventKeys(node.key)
    if (evKeys.length) {
      data._cx_events = evKeys.map((key, i) => ({ id: `${id}-ev${i}`, key, subs: [] }))
    }
    return createCxCompRuntime(id, node.key, children, data)
  }

  const seq = { n: 0 }
  const roots = Array.isArray(spec) ? spec : [spec]
  return roots.map((n, i) => hydrateNode(n, seq, String(i)))
}
