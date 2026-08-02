import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import {
  createEpTriggerRegistry,
  CxElementPlus,
  EP_STREAM_TRIGGERS,
} from '@lionad/cx-comps-element-plus'

import { buildDefaultData, buildSampleNode, type CxMeta } from '../app/dev/material-utils'
import { replayScriptOf } from '../app/dev/use-card-replay'
import { EP_FROZEN_KEYS } from '../app/dev/element-plus-categories'
import { elementPlusVariants } from '../app/dev/variants/element-plus'
import {
  containerVariants,
  dataVariants,
  feedbackVariants,
  formVariants,
  navigationVariants,
  tableVariants,
} from '../app/dev/variants/element-plus'

import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * element-plus 手写 variants 回放链路逐件验证：variants 即回放剧本（页面
 * useCardReplay 同一 replayScriptOf + buildSampleNode 数据路径），按 trigger
 * 形态分支断言——scalar 终态帧全字段逐键一致（完整 JSON 终态兜底）；
 * array 终态帧主数组长度与剧本一致（尾随标量随完整帧兜底，不逐键比对）；
 * region 终态槽集 ⊆ 声明 slots 且剧本槽不丢（缺槽剧本范式），另以手工双槽
 * 剧本锁定「剧本槽完整时终态槽集 = 剧本槽集」。
 * 数据键必须落在物料声明的 props 集内：页面 buildDefaultData 只做浅合并、
 * 不做键校验，越界键会静默落进 attrs 污染 DOM，在此静态证伪。
 * 挂载冒烟证伪展示数据合法性：空壳/真值剧本都是真实首帧，直访崩溃即
 * 生产事故（EP 组件真实渲染，根 vite.config 已 inline 防双 vue 实例；
 * 包装层 useAttrs 平铺故经 attrs 传值）。
 */

const materials = CxElementPlus as unknown as { _cx_meta: CxMeta }[]

const metaOf = (key: string): CxMeta => materials.find((x) => x._cx_meta.key === key)!._cx_meta

const componentOf = (key: string) => materials.find((x) => x._cx_meta.key === key)!

/** 页面同路径剧本 data：initial 浅合并 variant 覆盖 */
function mergedDataOf(key: string, override?: Record<string, unknown>): Record<string, unknown> {
  return { ...buildDefaultData(metaOf(key)), ...(override ?? {}) }
}

const groups = [
  ['feedback', feedbackVariants],
  ['data', dataVariants],
  ['navigation', navigationVariants],
  ['form', formVariants],
  ['table', tableVariants],
  ['container', containerVariants],
] as const

describe.each(groups)('element-plus %s variants', (_group, registry) => {
  const entries = Object.entries(registry)

  it.each(entries)('%s：数据键 ⊆ 物料声明 props 集', (key, defs) => {
    const declared = new Set(Object.keys(metaOf(key).props ?? {}))
    for (const def of defs) {
      for (const field of Object.keys(def.data ?? {})) {
        expect(declared.has(field), `${key}/${def.label} 数据键 ${field} 越界`).toBe(true)
      }
    }
  })

  it.each(entries)('%s：逐 variant 挂载不抛错且渲染非空', (key, defs) => {
    // 声明 default 槽的容器类（space/card）注入示例文本：与页面 buildSampleNode
    // 同一条槽内容路径——纯槽容器无子内容时渲染为空，无文本则冒烟恒败
    const slotsMeta = metaOf(key).slots as Record<string, unknown> | { key: string }[] | undefined
    const hasDefaultSlot = Array.isArray(slotsMeta)
      ? slotsMeta.some((s) => s?.key === 'default')
      : !!slotsMeta && typeof slotsMeta === 'object' && 'default' in slotsMeta
    for (const def of defs) {
      const wrapper = mount(componentOf(key) as object, {
        attrs: mergedDataOf(key, def.data),
        ...(hasDefaultSlot ? { slots: { default: '<span>示例内容</span>' } } : {}),
      })
      expect(wrapper.html().length, `${key}/${def.label} 应渲染非空`).toBeGreaterThan(0)
    }
  })
})

// ---- 回放链路逐件验证（三形态分支断言） ----

const triggerRegistry = createEpTriggerRegistry()

/** trigger 形态归类：scalar 独占 / array / region（与声明同源推导） */
function formOf(key: string): 'scalar' | 'array' | 'region' {
  const sections = EP_STREAM_TRIGGERS.find((c) => c.key === key)!.sections as {
    kind: string
  }[]
  const has = (kind: string) => sections.some((s) => s.kind === kind)
  if (has('scalar')) return 'scalar'
  if (has('array')) return 'array'
  return 'region'
}

const arrayKeyOf = (key: string): string =>
  (
    EP_STREAM_TRIGGERS.find((c) => c.key === key)!.sections.find((s) => s.kind === 'array') as {
      arrayKey: string
    }
  ).arrayKey

const TRIGGER_KEYS = EP_STREAM_TRIGGERS.map((c) => c.key)
const keysOfForm = (form: string) => TRIGGER_KEYS.filter((k) => formOf(k) === form)

/** 页面同路径剧本节点：buildSampleNode（initial 浅合并 + default 槽示例注入） */
function scriptNodeOf(key: string, override?: Record<string, unknown>) {
  return buildSampleNode(metaOf(key), { dataOverride: override })
}

/** 逐段前缀播放，返回 [是否出现增量帧, 终态帧]（nuiv4/comps 先例同款节奏） */
function replay(node: { key: string } & Record<string, unknown>): [boolean, CxStreamNode | null] {
  const script = replayScriptOf(node)
  const extractor = createIncrementalExtractor<CxSpec>({
    registry: triggerRegistry,
    matchTrigger: matchCxTrigger,
  })
  let saw = false
  const step = Math.max(1, Math.floor(script.length / 40))
  for (let i = step; i < script.length; i += step) {
    if (extractor.next(script.slice(0, i))) saw = true
  }
  return [saw, extractor.next(script) as CxStreamNode | null]
}

describe('trigger 同源与未注册件精确刻画', () => {
  it('10 件 trigger 逐件在注册表（回放按钮门控同源）', () => {
    expect(TRIGGER_KEYS).toHaveLength(10)
    for (const key of TRIGGER_KEYS) {
      expect(triggerRegistry.has(key), `${key} 应在注册表内`).toBe(true)
    }
  })

  it('17 件非 trigger 物料逐件不在注册表（无 trigger 不回放）', () => {
    const nonTrigger = EP_FROZEN_KEYS.filter(
      (short) => !TRIGGER_KEYS.includes(`cx-element-plus-${short}`),
    )
    expect(nonTrigger).toHaveLength(17)
    for (const short of nonTrigger) {
      expect(triggerRegistry.has(`cx-element-plus-${short}`), `${short} 不应有 trigger`).toBe(false)
    }
  })

  it('手写 variants 恰好覆盖全部 10 件 trigger 物料', () => {
    const handWritten = new Set(Object.keys(elementPlusVariants))
    const covered = TRIGGER_KEYS.filter((k) => handWritten.has(k))
    expect(covered).toHaveLength(10)
  })

  it('未注册物料回放：无增量帧、终态 null（17 件手写件逐件精确刻画）', () => {
    for (const [key, defs] of Object.entries(elementPlusVariants)) {
      if (TRIGGER_KEYS.includes(key)) continue
      const node = scriptNodeOf(key, defs[0]!.data)
      const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
      expect(saw, `${key} 无 trigger，回放不应出现增量帧`).toBe(false)
      expect(final, `${key} 无 trigger，终态应为 null`).toBeNull()
    }
  })
})

describe.each(keysOfForm('scalar'))('scalar 形态 · %s', (key) => {
  const defs = elementPlusVariants[key]!

  it.each(defs)('剧本「$label」回放有增量帧且终态全字段一致', (def) => {
    const node = scriptNodeOf(key, def.data)
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
    expect(final, `${key}/${def.label} 终态帧应存在`).not.toBeNull()
    // 终态帧 data 逐键收敛：fallback 键可被真值覆盖，剧本键一个不少；
    // undefined 覆盖键经 JSON.stringify 自然缺席，跳过比对
    for (const [field, value] of Object.entries(node.data)) {
      if (value === undefined) continue
      expect(
        JSON.stringify((final as { data?: Record<string, unknown> }).data?.[field]),
        `${key}/${def.label} 终态帧字段 ${field} 应与剧本一致`,
      ).toBe(JSON.stringify(value))
    }
    expect((final as { data?: Record<string, unknown> }).data?._cx_streaming).toBeUndefined()
  })
})

describe.each(keysOfForm('array'))('array 形态 · %s', (key) => {
  const defs = elementPlusVariants[key]!
  const arrayKey = arrayKeyOf(key)

  it.each(defs)('剧本「$label」回放终态主数组长度与剧本一致', (def) => {
    const node = scriptNodeOf(key, def.data)
    const expected = (node.data[arrayKey] as unknown[]).length
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
    const rows = (final as { data?: Record<string, unknown> })?.data?.[arrayKey] as unknown[]
    expect(rows, `${key}/${def.label} 终态帧主数组 ${arrayKey} 应存在`).toBeDefined()
    expect(rows.length, `${key}/${def.label} 终态主数组长度应 = 剧本 ${expected}`).toBe(expected)
  })
})

describe.each(keysOfForm('region'))('region 形态 · %s', (key) => {
  const defs = elementPlusVariants[key]!
  const declaredSlots = Object.keys((metaOf(key).slots ?? {}) as Record<string, unknown>)

  it.each(defs)('剧本「$label」回放终态槽集 ⊆ 声明 slots 且剧本槽不丢（缺槽剧本）', (def) => {
    const node = scriptNodeOf(key, def.data)
    const scriptSlots = Object.keys((node.components as Record<string, unknown>) ?? {})
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    // 剧本含 default 槽示例（buildSampleNode 注入）→ region 扫描路径有增量帧
    expect(scriptSlots, `${key} 剧本应含 default 槽示例`).toContain('default')
    expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
    const finalSlots = Object.keys(
      ((final as { components?: Record<string, unknown> })?.components ?? {}) as Record<
        string,
        unknown
      >,
    )
    for (const slot of finalSlots) {
      expect(declaredSlots, `${key}/${def.label} 终态槽 ${slot} 应 ∈ 声明 slots`).toContain(slot)
    }
    for (const slot of scriptSlots) {
      expect(finalSlots, `${key}/${def.label} 剧本槽 ${slot} 终态不应丢失`).toContain(slot)
    }
  })

  it('剧本槽完整：终态槽集 = 剧本槽集（default/header 双区齐）', () => {
    // buildSampleNode 只注入 default 槽示例，双槽完整剧本手工装配补齐
    const node = {
      id: 'replay-card-full',
      key,
      data: { shadow: 'hover' },
      components: {
        default: [{ id: 't1', key: 'cx-text', data: { content: '主体区' } }],
        header: [{ id: 't2', key: 'cx-text', data: { content: '头部区' } }],
      },
    }
    const [saw, final] = replay(node)
    expect(saw, `${key} 双槽剧本回放应出现增量帧`).toBe(true)
    const finalSlots = Object.keys(
      ((final as { components?: Record<string, unknown> })?.components ?? {}) as Record<
        string,
        unknown
      >,
    )
    expect(finalSlots, `${key} 终态槽集应 = 剧本槽集`).toEqual(['default', 'header'])
    expect((final as { data?: Record<string, unknown> })?.data?.shadow).toBe('hover')
  })
})
