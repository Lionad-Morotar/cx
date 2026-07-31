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

/** 组件流式声明：多形态组合编译为单个 IncrementalTrigger */
export interface StreamTriggerConfig {
  /** 物料 meta key 原值（def._cx_meta.key，不用 kebab/camel 往返的派生值） */
  key: string
  /** 形态组合；契约：至多一个 array 形态 + 至多一个 region 形态 */
  sections: Array<ArraySectionConfig | RegionSectionConfig>
  stateBranch?: StateBranchConfig
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
  if (config.sections.some((section) => section.kind === 'region')) {
    throw new Error('compileTrigger: region 形态尚未实现')
  }
  if (config.stateBranch?.emptyPassthrough) {
    throw new Error('compileTrigger: stateBranch 尚未实现')
  }

  const scanPaths: ScanPath[] = []
  let mainPath: ScanPath | null = null
  if (arraySection) {
    mainPath = ['data', arraySection.arrayKey, '*']
    scanPaths.push(mainPath, ...(arraySection.extraScanPaths ?? []))
  }

  return {
    scanPaths,
    buildPartial: (spec: CxSpec, matchesPerPath: MatchesPerPath): CxSpec | null => {
      const node = pickNode(spec, config.key)
      if (!node) return null

      let produced = false
      let data = node.data

      if (arraySection && mainPath) {
        const complete = matchesPerPath.get(JSON.stringify(mainPath))?.length ?? 0
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

      if (!produced) return null

      return { ...node, data }
    },
  }
}
