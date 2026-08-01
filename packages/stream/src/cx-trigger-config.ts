/**
 * cx 协议预设 · 声明式流式触发器 DSL
 *
 * ArrayTriggerConfig 向多形态声明演进的一步：判别联合形态经 compileTrigger
 * 编译为管线消费的 IncrementalTrigger。数组形态与 createArrayTrigger 语义
 * 同一，但把 complete===0 守卫从段内提升到整体 buildPartial 末尾——纯数组
 * 形态下提升前后行为完全一致；组合形态（array+region / array+stateBranch）
 * 下若保留段内短路，空表与"列未到、区域先现"都会被短路掉后续形态。
 */

import type { IncrementalTrigger, MatchesPerPath } from './core/incremental'
import type { ScanPath } from './core/types'
import type { ArrayTriggerConfig } from './cx-array-trigger'
import type { CxSpec, CxStreamNode } from './cx'

/** 数组项形态：字段名同 ArrayTriggerConfig，现有声明可机械包装迁移 */
export interface ArraySectionConfig {
  kind: 'array'
  /** data 下流式增长的主数组字段名 */
  arrayKey: string
  /** 主数组之外的补充扫描路径（次增长数组：列定义/系列/路线/操作按钮） */
  extraScanPaths?: ScanPath[]
  /**
   * 必需字段序列化在主数组之后时的推导兜底，
   * 与生成侧转译器同一推导语义（真实字段已传输则不覆盖）。
   */
  deriveTailFields?: (completeRows: unknown[]) => Record<string, unknown>
}

/** 复合区域形态：每个内容 slot 是可独立揭示的 section */
export interface RegionSectionConfig {
  kind: 'region'
  /** 内容区域 slot 名清单；揭示序 = 声明序 = 序列化序，编译期不重排 */
  slots: string[]
}

/** 状态分支规则：附属于主切分点而非独立 section */
export interface StateBranchConfig {
  /**
   * 主数组闭合且 0 元素时透传节点（携带空数组）而非保持 lastValid，
   * 由组件内置空态渲染接管。空态内容属组件契约，trigger 只负责揭示时机。
   */
  emptyPassthrough?: boolean
}

/**
 * 标量主体形态：组件无增长容器字段，属性「完成」（闭合事件）即切分点。
 * 截断永远落在闭合事件处，帧内绝无 jsonrepair 伪造的半值；
 * key 字符串闭合即首个事件，空壳帧随之提前挂载。
 * 机制取证与策略映射见 docs/research/2026-08-01-scalar-stream-strategies.md。
 */
export interface ScalarSectionConfig {
  kind: 'scalar'
  /**
   * 空壳帧兜底（??= 语义，真实字段已传输则不覆盖）。
   * 标量主体组件常有必填契约（如 article 的 type/content），
   * key 检出即挂载的空壳帧据此保持契约合法。
   */
  fallbackData?: Record<string, unknown>
  /**
   * 流式期间以骨架占位的字段清单。未传输（未闭合）的声明字段向 data 注入
   * `_cx_streaming` 标记而非半值，由组件包装层读标记渲染骨架；
   * 字段完整到达后标记移除、骨架一次性替换为完整内容。
   */
  skeletonFields?: string[]
}

/** 组件流式声明：多形态组合编译为单个 IncrementalTrigger */
export interface StreamTriggerConfig {
  /** 物料 meta key 原值（def._cx_meta.key，不用 kebab/camel 往返的派生值） */
  key: string
  /**
   * 形态组合；契约：至多一个 array 形态 + 至多一个 region 形态，
   * scalar 形态独占（与 array/region 组合无现实样本，组合语义留作演进空间）
   */
  sections: Array<ArraySectionConfig | RegionSectionConfig | ScalarSectionConfig>
  stateBranch?: StateBranchConfig
  /**
   * 出帧节流（delta 数，缺省 1 = 每 delta 都可出帧）。
   * 短属性扎堆闭合时合并为一帧；末尾等不到窗口的属性由终态 spec 兜底。
   */
  frameStride?: number
}

// 与 cx-array-trigger 的 pickNode 逐字相同是有意复制：跨模块导出共享会让
// 既有全部数组声明的依赖面随本模块演进被动扩大，回归风险大于重复成本。
function pickNode(spec: CxSpec, key: string): CxStreamNode | null {
  const nodes = Array.isArray(spec) ? spec : [spec]
  return nodes.find((node) => node.key === key) ?? null
}

/** 现有 ArrayTriggerConfig → 新 DSL 的一对一迁移包装（identity 等价，见测试） */
export function fromArrayTriggerConfig(config: ArrayTriggerConfig): StreamTriggerConfig {
  return {
    key: config.key,
    sections: [
      {
        kind: 'array',
        arrayKey: config.arrayKey,
        extraScanPaths: config.extraScanPaths,
        deriveTailFields: config.deriveTailFields,
      },
    ],
  }
}

/**
 * 声明 → IncrementalTrigger 编译器。
 *
 * scanPaths 由各形态汇聚；buildPartial 中形态依次施加于同一节点
 * （各动各的字段域：array 动 data，region 动 components），整体守卫
 * 落在末尾——所有形态均无可构造内容时才返回 null 交 lastValid。
 */
export function compileTrigger(config: StreamTriggerConfig): IncrementalTrigger<CxSpec> {
  // 契约上限之外的组合显式拒绝：find 取首个的静默丢弃会让其余数组永不切分
  if (config.sections.filter((section) => section.kind === 'array').length > 1) {
    throw new Error('compileTrigger: 每 trigger 至多一个 array 形态')
  }
  const arraySection = config.sections.find(
    (section): section is ArraySectionConfig => section.kind === 'array',
  )
  const regionSection = config.sections.find(
    (section): section is RegionSectionConfig => section.kind === 'region',
  )
  const scalarSection = config.sections.find(
    (section): section is ScalarSectionConfig => section.kind === 'scalar',
  )
  // scalar 形态独占：与 array/region 组合时截断源语义冲突（容器边界 vs 闭合
  // 事件），无现实样本支撑组合语义，显式拒绝优于静默退化
  if (scalarSection && config.sections.length > 1) {
    throw new Error('compileTrigger: scalar 形态不与 array/region 组合')
  }
  // 闭合信号与 0 元素断言均编译自主数组路径，无 array 形态时无从生成
  if (config.stateBranch?.emptyPassthrough && !arraySection) {
    throw new Error('compileTrigger: stateBranch 要求 array 形态')
  }

  // --- 标量主体形态：无 scanPaths，属性闭合事件经管线 closureFallback 驱动 ---
  if (scalarSection) {
    const fallback = scalarSection.fallbackData ?? {}
    const skeletonFields = scalarSection.skeletonFields ?? []
    return {
      scanPaths: [],
      usesClosureEvents: true,
      frameStride: config.frameStride,
      buildPartial: (spec: CxSpec): CxSpec | null => {
        const node = pickNode(spec, config.key)
        if (!node) return null
        // 截断机制保证 data 内值皆完整；fallback 仅补未传输字段（??= 语义）
        const transmitted = node.data ?? {}
        const data: Record<string, unknown> = { ...fallback, ...transmitted }
        // 骨架标记判据只需 parsed data 缺席性：截断保证「缺席 ⟺ 未闭合」，
        // 未传输的 skeleton 字段注入标记，包装层读标记渲染骨架
        const streaming = skeletonFields.filter((field) => !(field in transmitted))
        if (streaming.length > 0) {
          data._cx_streaming = streaming
        }
        return { ...node, data }
      },
    }
  }

  const scanPaths: ScanPath[] = []
  let mainPath: ScanPath | null = null
  let containerPath: ScanPath | null = null
  if (arraySection) {
    mainPath = ['data', arraySection.arrayKey, '*']
    scanPaths.push(mainPath, ...(arraySection.extraScanPaths ?? []))
    // 容器级路径不带 *：匹配 ⟺ 主数组容器闭合，据此区分
    // 「闭合且 0 元素」（真空表，透传空态）与「尚未开始传输」（保持 lastValid）
    if (config.stateBranch?.emptyPassthrough) {
      containerPath = ['data', arraySection.arrayKey]
      scanPaths.push(containerPath)
    }
  }
  const slotPaths = new Map<string, ScanPath>()
  if (regionSection) {
    for (const slot of regionSection.slots) {
      const path: ScanPath = ['components', slot, '*']
      slotPaths.set(slot, path)
      scanPaths.push(path)
    }
  }

  return {
    scanPaths,
    buildPartial: (spec: CxSpec, matchesPerPath: MatchesPerPath): CxSpec | null => {
      const node = pickNode(spec, config.key)
      if (!node) return null

      let produced = false
      let data = node.data
      let components = node.components

      let complete = 0
      if (arraySection && mainPath) {
        complete = matchesPerPath.get(JSON.stringify(mainPath))?.length ?? 0
        if (complete > 0) {
          const rows = (node.data?.[arraySection.arrayKey] as unknown[] | undefined) ?? []
          const completeRows = rows.slice(0, complete)
          const next: Record<string, unknown> = {
            ...node.data,
            [arraySection.arrayKey]: completeRows,
          }
          if (arraySection.deriveTailFields) {
            for (const [k, v] of Object.entries(arraySection.deriveTailFields(completeRows))) {
              next[k] ??= v
            }
          }
          data = next
          produced = true
        }
      }

      // 空态透传：主数组闭合且 0 完整行时放行节点（携带空数组），组件内置
      // 空态接管渲染；空态内容属组件契约，trigger 只负责揭示时机
      if (!produced && containerPath && complete === 0) {
        const closed = (matchesPerPath.get(JSON.stringify(containerPath))?.length ?? 0) > 0
        if (closed) {
          data = node.data ? { ...node.data } : node.data
          produced = true
        }
      }

      // 声明 slot 计数 0 即无条件从分组移除：跨截断点区域经 jsonrepair 补成
      // 的残缺项不依赖管线物理截断兜底，契约层自行剔除。未声明 slot 不属
      // region 字段域，原样保留；components 为数组形态（非分组）时不干预。
      if (regionSection && components && !Array.isArray(components)) {
        const filtered: Record<string, CxStreamNode[]> = {}
        for (const [slot, items] of Object.entries(components)) {
          const path = slotPaths.get(slot)
          if (!path) {
            filtered[slot] = items
            continue
          }
          const count = matchesPerPath.get(JSON.stringify(path))?.length ?? 0
          if (count > 0) {
            filtered[slot] = items.slice(0, count)
            produced = true
          }
        }
        components = filtered
      }

      if (!produced) return null

      return { ...node, data, components }
    },
  }
}
