import type { CxAppendItem } from '@lionad/cx-vue'

/**
 * event-semantics — 物料×事件二维分流与回写文本构造(cx 卡片的 SDK 默认语义)
 *
 * cx 卡片交互事件的语义不在渲染层:同一事件在不同物料上语义不同——选项列表
 * 的 change 是「暂存待确认」、数据表格的 link-click 是「直发回写」。本模块把
 * 「物料 key × 事件名」映射为四态处置(direct/append/confirm/ignore)与对应
 * 用户口吻回写文本,宿主消费方(聊天卡片等)只做副作用承接(emit 消息 / 写暂存),
 * 语义本身随物料同包发布——物料新增或改事件键时与本模块同步演进,同仓防漂移
 * 测试钉死对齐。
 *
 * 语义表未注册事件的缺省兜底可配:默认 ignore(零副作用),unregistered:
 * 'passthrough' 时全量透传给业务方自决(经 passthroughText 给文案)——消极动作
 * (cancel/back 等)的业务语义由宿主掌握,cx 只提供通道不预置立场。
 *
 * 数据驱动(默认表)而非 switch:表可遍历、可与 meta emits 做集合断言;宿主需
 * 定制时用 defineCxEventSemantics 按物料键级覆盖,文案函数返回 undefined 即
 * 落回默认,不必整表复制。
 */

export type CxEventDispositionKind = 'direct' | 'append' | 'confirm' | 'ignore' | 'passthrough'

/** 物料 key → 该物料的卡片语义分类 */
export type CxEventDisposition =
  | { kind: 'direct' }
  | { kind: 'append' }
  | { kind: 'confirm' }
  | { kind: 'ignore' }
  | { kind: 'passthrough' }

/**
 * 默认二维分流表(仅列非 ignore 项,查表缺省即 ignore——与「未声明事件零副作用」
 * 语义一致,同时允许物料 meta emits 全集接线,多余事件自然落空):
 * - direct: 动作类,点击即回写消息直发
 * - append: 表单字段变更,写暂存
 * - confirm: 表单确认动作,暂存拼接 confirm 语义连发后清该卡片暂存
 */
export const DEFAULT_CX_EVENT_DISPOSITIONS: Record<string, Record<string, CxEventDispositionKind>> = {
  'cx-vtu-option-list': { action: 'confirm', change: 'append' },
  'cx-vtu-approval-card': { confirm: 'confirm' },
  'cx-vtu-data-table': { 'link-click': 'direct' },
  'cx-vtu-item-carousel': { 'item-click': 'direct', 'item-action': 'direct' },
  'cx-vtu-message-draft': { send: 'direct', undo: 'append' },
  'cx-vtu-question-flow': { select: 'append', 'step-change': 'append', complete: 'confirm' },
  'cx-vtu-preferences-panel': { change: 'append', action: 'confirm' },
  'cx-vtu-parameter-slider': { change: 'append', action: 'confirm' },
}

/** 选择值 → 用户口吻文本(数组逗号连接;空值空串;其余 String) */
export function cxSelectionToText(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ')
  if (value === null || value === undefined) return ''
  return String(value)
}

/** 直发回写文本(动作类:行级点击/条目点击/草稿发送) */
function defaultDirectText(materialKey: string, event: string, args: unknown[]): string {
  switch (materialKey) {
    case 'cx-vtu-data-table': {
      const p = (args[0] ?? {}) as {
        rowIndex?: number
        text?: string
        row?: string[]
        column?: { label?: string; title?: string }
      }
      const colLabel = p.column?.label ?? p.column?.title ?? ''
      const rowSummary = (p.row ?? []).filter(Boolean).join(' / ')
      const rowNo = typeof p.rowIndex === 'number' && p.rowIndex >= 0 ? p.rowIndex + 1 : undefined
      const head = `点了表格${rowNo ? `第${rowNo}行` : '一行'}的「${p.text || colLabel}」`
      return rowSummary ? `${head}(行内容:${rowSummary})` : head
    }
    case 'cx-vtu-item-carousel':
      return event === 'item-action'
        ? `条目 ${String(args[0])} 执行 ${String(args[1])}`
        : `查看条目 ${String(args[0])}`
    case 'cx-vtu-message-draft':
      return '发送草稿'
    default:
      return cxSelectionToText(args[0])
  }
}

/** 暂存回写文本(表单字段变更摘要,进暂存条目的 text 字段) */
function defaultAppendText(materialKey: string, event: string, args: unknown[]): string {
  switch (materialKey) {
    case 'cx-vtu-option-list':
      // change 载荷已被物料包装件翻译为选项 label(单选 label / 多选 label 数组)
      return `已选:${cxSelectionToText(args[0])}`
    case 'cx-vtu-question-flow':
      return event === 'select'
        ? `已选:${cxSelectionToText(args[0])}`
        : `切换步骤:${String(args[0])}`
    case 'cx-vtu-message-draft':
      return '撤销草稿'
    default:
      // preferences-panel/parameter-slider 的 change:整值 JSON 摘要(截断防爆)
      return `参数:${truncateJson(args[0])}`
  }
}

function truncateJson(value: unknown, max = 60): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value)
  if (raw === undefined) return ''
  return raw.length > max ? `${raw.slice(0, max)}…` : raw
}

/**
 * 从事件载荷推导字段键(与物料内部字段态标识对齐):
 * 暂存条目 id 以 `widgetId:fieldId` 幂等(同字段反复变更只留最新),且 deselect
 * 联动据此精确恢复物料字段态;取不到时退化事件名(联动粒度变粗,暂存语义不受影响)。
 */
function cxFieldId(materialKey: string, event: string, args: unknown[]): string {
  switch (materialKey) {
    case 'cx-vtu-preferences-panel': {
      // change 载荷整值对象:取首键(单字段切换场景即该字段)
      const v = args[0]
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const keys = Object.keys(v as Record<string, unknown>)
        if (keys.length) return keys[0]!
      }
      return event
    }
    case 'cx-vtu-parameter-slider': {
      // change 载荷 SliderValue[]:取首滑块 id
      const v = args[0]
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null) {
        const id = (v[0] as { id?: unknown }).id
        if (typeof id === 'string') return id
      }
      return event
    }
    case 'cx-vtu-question-flow':
      return event === 'select' ? `select:${cxSelectionToText(args[0])}` : event
    case 'cx-vtu-message-draft':
      return 'body'
    default:
      return event
  }
}

/** confirm 连发文本:暂存拼接 + confirm 语义;无暂存退化为纯 confirm 文本 */
function defaultConfirmText(materialKey: string, appendsTexts: string[]): string {
  const semantic =
    materialKey === 'cx-vtu-question-flow'
      ? '完成问卷'
      : materialKey === 'cx-vtu-option-list'
        ? '确认选择'
        : materialKey === 'cx-vtu-preferences-panel' || materialKey === 'cx-vtu-parameter-slider'
          ? '应用设置'
          : '确认执行'
  if (!appendsTexts.length) return semantic
  return `${appendsTexts.join('；')}，${semantic}`
}

/** 事件语义接口(默认实例六法,覆盖后同构) */
export interface CxEventSemantics {
  classify(materialKey: string, event: string): CxEventDisposition
  directText(materialKey: string, event: string, args: unknown[]): string
  appendText(materialKey: string, event: string, args: unknown[]): string
  eventToAppend(
    materialKey: string,
    event: string,
    args: unknown[],
    widgetId: string,
    label?: string
  ): CxAppendItem
  confirmText(materialKey: string, appendsTexts: string[]): string
  /**
   * 透传事件的回写文本(passthrough 态):语义表未注册的事件到达宿主时,
   * 业务方决定回写什么;返回 undefined 即该事件不回应(等效 ignore)。
   * 默认实现恒 undefined——cx 不替业务方发言,消极动作文案属业务决策。
   */
  passthroughText(materialKey: string, event: string, args: unknown[]): string | undefined
}

export interface CxEventSemanticsOverrides {
  /** 按物料键级合并:{...默认行, ...覆盖行}(整行替换请写全该行) */
  dispositions?: Record<string, Record<string, CxEventDispositionKind>>
  /**
   * 语义表未注册事件的缺省处置,默认 'ignore'(零副作用兜底,防技术事件噪声)。
   * 'passthrough' 时未注册事件全量透传给业务方处置——注意透传面包含物料
   * emits 声明的技术事件(如 update:modelValue),业务方 passthroughText 需自行甄别;
   * 接线侧(hydrate)本就按物料 emits 全集接线,透传只是让分流层不再吞掉它们。
   */
  unregistered?: 'ignore' | 'passthrough'
  /** 返回 undefined 即落默认文案 */
  directText?(materialKey: string, event: string, args: unknown[]): string | undefined
  appendText?(materialKey: string, event: string, args: unknown[]): string | undefined
  confirmText?(materialKey: string, appendsTexts: string[]): string | undefined
  /** 透传事件回写文本;返回 undefined 即该事件不回应 */
  passthroughText?(materialKey: string, event: string, args: unknown[]): string | undefined
}

export function defineCxEventSemantics(overrides: CxEventSemanticsOverrides = {}): CxEventSemantics {
  const table: Record<string, Record<string, CxEventDispositionKind>> = {
    ...DEFAULT_CX_EVENT_DISPOSITIONS,
  }
  for (const [key, row] of Object.entries(overrides.dispositions ?? {})) {
    table[key] = { ...table[key], ...row }
  }

  const directText: CxEventSemantics['directText'] = (key, event, args) =>
    overrides.directText?.(key, event, args) ?? defaultDirectText(key, event, args)
  const appendText: CxEventSemantics['appendText'] = (key, event, args) =>
    overrides.appendText?.(key, event, args) ?? defaultAppendText(key, event, args)
  const confirmText: CxEventSemantics['confirmText'] = (key, texts) =>
    overrides.confirmText?.(key, texts) ?? defaultConfirmText(key, texts)

  const passthroughText: CxEventSemantics['passthroughText'] = (key, event, args) =>
    overrides.passthroughText?.(key, event, args)

  return {
    classify: (materialKey, event) => {
      const kind = table[materialKey]?.[event]
      return { kind: kind ?? (overrides.unregistered ?? 'ignore') }
    },
    directText,
    appendText,
    eventToAppend: (materialKey, event, args, widgetId, label) => {
      const text = appendText(materialKey, event, args)
      const fieldId = cxFieldId(materialKey, event, args)
      return { id: `${widgetId}:${fieldId}`, label: label || text, text, widgetId, fieldId }
    },
    confirmText,
    passthroughText,
  }
}

const defaultSemantics = defineCxEventSemantics()

/** 默认实例顶层函数:宿主零定制时直接消费(与 defineCxEventSemantics().x 同构) */
export const classifyCxEvent = defaultSemantics.classify
export const cxDirectText = defaultSemantics.directText
export const cxAppendText = defaultSemantics.appendText
export const cxEventToAppend = defaultSemantics.eventToAppend
export const cxConfirmText = defaultSemantics.confirmText
export const cxPassthroughText = defaultSemantics.passthroughText
