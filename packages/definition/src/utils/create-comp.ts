import type { CxComponentData, CxComponentRuntime } from '../types'

/**
 * 纯结构声明工厂——构造一个 CxComponentRuntime 节点（schema-as-data）。
 *
 * 与 createCxUtils(cx).createComponent（运行时实例化、依赖 loader、从 meta 拉
 * props/emits/slots/data、生成 id）职责正交：本函数不触网、不读 meta，仅填默认空字段，
 * 供 schema 静态组装页面树。强行复用运行时版会把静态 schema 拖进 loader 依赖，
 * 破坏低代码「schema 是数据」的范式。
 *
 * 形参类型严格收口（data 为 CxComponentData），替代业务方手写时用
 * `as CxComponentRuntime` 强转规避类型检查的旧习。
 */
export function createCxCompRuntime(
  id: string,
  key: string,
  children: Record<string, CxComponentRuntime[]> = {},
  data: CxComponentData = {},
): CxComponentRuntime {
  return {
    id,
    key,
    name: id,
    data,
    components: children,
    parents: [],
    aliasKeys: [],
    props: {},
    emits: {},
    exposes: {},
  }
}

/**
 * 贴近原业务方 node 调用习惯的别名。
 *
 * schema 文件迁移时作机械替换（node(...) → cxNode(...)），签名与位置参数顺序一致。
 */
export { createCxCompRuntime as cxNode }
