import type { CxComponentRuntime } from '@lionad/cx-definition'
import type { CxStreamNode } from '@lionad/cx-stream'

// dev 物料验收页共享：从物料 _cx_meta 构造示例 data + CxRender node。
// 提取自 /dev/components.vue，供 v2/v4 验收页复用。

export interface CxMeta {
  key: string
  name: string
  description?: string
  headless?: boolean
  props?: Record<string, { initial?: unknown; type?: string }>
  slots?: unknown
}

export interface DevItem {
  meta: CxMeta
  node: CxComponentRuntime
}

// 从物料 props 的 initial 构造默认 data，供 CxRender 渲染示例。
// 文本类（short）初始为空串时回填示例文本，否则 preview 只渲染出一个占位空格；
// custom 类型的 initial 常为函数（如 table/accordion 的 items），需调用取值。
export function buildDefaultData(meta: CxMeta): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const [k, p] of Object.entries(meta.props || {})) {
    if (p?.initial === undefined) {
      continue
    }
    const raw = typeof p.initial === 'function' ? p.initial() : p.initial
    data[k] = raw === '' && p.type === 'short' ? `${meta.name}示例` : raw
  }
  return data
}

export function textNode(content: string): CxComponentRuntime {
  return {
    id: `dev-text-${content}`,
    key: 'cx-text',
    name: '文本',
    aliasKeys: [],
    data: { content },
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {},
  } as CxComponentRuntime
}

export function toItem(comp: { _cx_meta: CxMeta }): DevItem {
  const meta = comp._cx_meta
  const node = {
    id: `dev-${meta.key}`,
    key: meta.key,
    name: meta.name,
    aliasKeys: [],
    data: buildDefaultData(meta),
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {},
  } as CxComponentRuntime
  // 仅当物料声明 default slot 时才塞示例文本（容器类）；数据驱动组件（breadcrumb/select 等
  // 用 #item 或无 default slot）靠 props initial 渲染，注入 default 会 fallback 显示遮蔽真实组件
  const slotsMeta = meta.slots as any
  let hasDefaultSlot = false
  if (Array.isArray(slotsMeta)) {
    hasDefaultSlot = slotsMeta.some((s: any) => s?.key === 'default')
  } else if (slotsMeta && typeof slotsMeta === 'object') {
    hasDefaultSlot = 'default' in slotsMeta
  }
  if (hasDefaultSlot) {
    node.components = { default: [textNode('示例内容')] }
  }
  return { meta, node }
}

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
