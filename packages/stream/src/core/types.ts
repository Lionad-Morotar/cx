/**
 * @lionad/cx-stream 共享类型
 *
 * 管线对树形状无感知：所有结构约束都是最小化的，
 * 具体协议（如 cx 组件树）由消费端经配置与 trigger 注入。
 */

/** 括号平衡扫描的匹配结果 */
export interface ScanMatch {
  /** 闭合 `}` / `]` 在原始文本中的位置 */
  end: number
  /** 匹配容器的具体结构路径（通配符已解析为实际 key/索引），供截断补括号使用 */
  path: PathSegment[]
}

/** 路径段：字符串匹配对象 key，数字匹配数组索引，`'*'` 通配任意 */
export type PathSegment = string | number

/** JSON 结构路径，如 `['data', 'columns', '*']` */
export type ScanPath = PathSegment[]
