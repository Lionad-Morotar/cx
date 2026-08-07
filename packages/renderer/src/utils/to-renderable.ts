/**
 * to-renderable — 「部分树 → 可渲染树」管线
 *
 * 增量提取的出帧含「id 闭合、key 未传」的补全后代(closingBrackets 合法补全产物);
 * 渲染按 key 匹配物料,key 缺失即不可渲染,穿透到渲染层成 key=undefined 节点。
 * 本管线先经 pruneIncompleteNode 递归修剪保持「完整前缀树」语义,再经 hydrate
 * 赋确定性 id(同 spec 结构同 id 序列,CxRender 按 id 复用实例抗全表闪烁)
 * 并透传 cx 推导 _cx_events——增量区与闭合卡同一事件接线来源。
 */
import { pruneIncompleteNode } from '@lionad/cx-stream'
import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'
import type { CxComponentRuntime, CxLoaderInstance } from '@lionad/cx-definition'

import { hydrateCxSpec } from './hydrate'

/**
 * 部分 Spec → 可渲染运行时树;修剪后无可渲染节点返回 null(宿主据此保持骨架)。
 * cx 可选:传入时交互物料经 meta emits 全集接线;不传则不注入事件(纯预览场景)。
 */
export function toRenderableComponents(
  spec: CxSpec | null,
  prefix: string,
  cx?: CxLoaderInstance,
): CxComponentRuntime[] | null {
  if (!spec) return null
  if (Array.isArray(spec)) {
    const pruned = spec.map(pruneIncompleteNode).filter((n): n is CxStreamNode => n !== null)
    return pruned.length > 0 ? hydrateCxSpec(pruned, prefix, { cx }) : null
  }
  const pruned = pruneIncompleteNode(spec)
  return pruned ? hydrateCxSpec(pruned, prefix, { cx }) : null
}
