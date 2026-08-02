import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import {
  CxNaiveUi,
  NAIVE_UI_STREAM_TRIGGERS,
  createNaiveUiTriggerRegistry,
} from '@lionad/cx-comps-naive-ui'

import { buildDefaultData, buildSampleNode, type CxMeta } from '../app/dev/material-utils'
import { replayScriptOf } from '../app/dev/use-card-replay'
import { NAIVE_UI_FROZEN_KEYS } from '../app/dev/naive-ui-categories'
import { naiveUiVariants } from '../app/dev/variants/naive-ui'
import {
  containerVariants,
  dataVariants,
  feedbackVariants,
  formVariants,
  navigationVariants,
  tableVariants,
} from '../app/dev/variants/naive-ui'

import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * naive-ui 手写 variants 回放链路逐件验证：variants 即回放剧本（页面
 * useCardReplay 同一 replayScriptOf + buildSampleNode 数据路径），按 trigger
 * 形态分支断言——scalar 终态帧全字段逐键一致（完整 JSON 终态兜底）；
 * array 终态帧主数组长度与剧本一致；region 终态槽集 ⊆ 声明 slots 且剧本槽不丢。
 * 无手写 variants 的 trigger 物料以默认兜底剧本（initial 数据 + default 槽示例）
 * 参与同一断言链，回放覆盖不因切片推进节奏缺席。
 * 数据键必须落在物料声明的 props 集内：页面 buildDefaultData 只做浅合并、
 * 不做键校验，越界键会静默落进 attrs 污染 DOM，在此静态证伪。
 * 挂载冒烟证伪展示数据合法性（N 组件真挂载，css-render 在测试环境可注入样式；
 * 包装层 useAttrs 平铺故经 attrs 传值，无 inject 依赖无需 provide 载荷）。
 */

const materials = CxNaiveUi as unknown as { _cx_meta: CxMeta }[]

const metaOf = (key: string): CxMeta => materials.find((x) => x._cx_meta.key === key)!._cx_meta

const componentOf = (key: string) => materials.find((x) => x._cx_meta.key === key)!

/** 页面同路径剧本 data：initial 浅合并 variant 覆盖 */
function mergedDataOf(key: string, override?: Record<string, unknown>): Record<string, unknown> {
  return { ...buildDefaultData(metaOf(key)), ...override }
}

const groups = [
  ['feedback', feedbackVariants],
  ['data', dataVariants],
  ['navigation', navigationVariants],
  ['form', formVariants],
  ['table', tableVariants],
  ['container', containerVariants],
] as const

// 分类文件随后续切片落地后并入 groups；registry 为空属合法终态，跳过避免空 suite
const nonEmptyGroups = groups.filter(([, registry]) => Object.keys(registry).length > 0)

describe.each(nonEmptyGroups)('naive-ui %s variants', (_group, registry) => {
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
    for (const def of defs) {
      const wrapper = mount(componentOf(key) as object, {
        attrs: mergedDataOf(key, def.data),
        // space 为纯原生槽容器（空槽无 DOM），冒烟注入占位槽内容方可断言渲染非空；
        // 其余物料自身模板恒有结构，多传的 slots 不被消费无害
        slots: key === 'cx-naive-ui-space' ? { default: '<span>占位</span>' } : undefined,
      })
      expect(wrapper.html().length, `${key}/${def.label} 应渲染非空`).toBeGreaterThan(0)
    }
  })
})

// ---- date-picker 值渲染专项（守卫未误杀） ----

describe('date-picker variants 值真实渲染（守卫未误杀）', () => {
  // wrapper 守卫对 token 不匹配的 formattedValue 删除回退空态——「渲染非空」
  // 无法区分「值正确显示」与「守卫回退空态」，须断言日期文本进输入框值
  it('三组 variant 的日期值真实渲染进输入框', () => {
    for (const def of formVariants['cx-naive-ui-date-picker']!) {
      // expected 与挂载数据严格同源（initial 浅合并产物），不写平行常量——
      // 否则物料 initial 改值而常量未同步时空组断言会假绿
      const merged = mergedDataOf('cx-naive-ui-date-picker', def.data)
      const wrapper = mount(componentOf('cx-naive-ui-date-picker') as object, {
        attrs: merged,
      })
      const shown = (wrapper.find('input').element as HTMLInputElement).value
      const expected = (merged.formattedValue as string | undefined) ?? ''
      // 显示格式随 type 自适应且与三组 valueFormat 同源：逐段比对日期与时间文本
      for (const segment of expected.split(' ')) {
        expect(shown, `${def.label} 输入框值应含 ${segment}`).toContain(segment)
      }
    }
  })
})

// ---- 回放链路逐件验证（三形态分支断言） ----

const triggerRegistry = createNaiveUiTriggerRegistry()

/** trigger 形态归类：scalar 独占 / array / region（naive 无 array+region 组合件） */
function formOf(key: string): 'scalar' | 'array' | 'region' {
  const sections = NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === key)!.sections as {
    kind: string
  }[]
  const has = (kind: string) => sections.some((s) => s.kind === kind)
  if (has('scalar')) return 'scalar'
  if (has('array')) return 'array'
  return 'region'
}

const arrayKeyOf = (key: string): string =>
  (
    NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === key)!.sections.find(
      (s) => s.kind === 'array',
    ) as { arrayKey: string }
  ).arrayKey

const TRIGGER_KEYS = NAIVE_UI_STREAM_TRIGGERS.map((c) => c.key)
const keysOfForm = (form: string) => TRIGGER_KEYS.filter((k) => formOf(k) === form)

/** 页面同路径剧本节点：buildSampleNode（initial 浅合并 + default 槽示例注入） */
function scriptNodeOf(key: string, override?: Record<string, unknown>) {
  return buildSampleNode(metaOf(key), { dataOverride: override })
}

/** 逐段前缀播放，返回 [是否出现增量帧, 终态帧]（nuiv4 先例同款节奏） */
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

/** 手写 variants 缺席时的默认兜底剧本（initial 数据经 buildSampleNode 注入） */
const FALLBACK_DEFS = [{ label: '默认兜底', data: {} }]

describe('trigger 同源与未注册件精确刻画', () => {
  it('12 件 trigger 逐件在注册表（回放按钮门控同源）', () => {
    expect(TRIGGER_KEYS).toHaveLength(12)
    for (const key of TRIGGER_KEYS) {
      expect(triggerRegistry.has(key), `${key} 应在注册表内`).toBe(true)
    }
  })

  it('15 件非 trigger 物料逐件不在注册表（无 trigger 不回放）', () => {
    const nonTrigger = NAIVE_UI_FROZEN_KEYS.filter(
      (short) => !TRIGGER_KEYS.includes(`cx-naive-ui-${short}`),
    )
    expect(nonTrigger).toHaveLength(15)
    for (const short of nonTrigger) {
      expect(triggerRegistry.has(`cx-naive-ui-${short}`), `${short} 不应有 trigger`).toBe(false)
    }
  })

  it('手写 variants 恰好覆盖 12 件 trigger 物料（表单切片不涉 trigger，计数已收敛）', () => {
    const handWritten = new Set(Object.keys(naiveUiVariants))
    const covered = TRIGGER_KEYS.filter((k) => handWritten.has(k))
    expect(covered).toHaveLength(12)
    // 反向：手写件里的非 trigger 物料（button/badge/tag/progress/divider/space）不回放，无冲突
    for (const key of handWritten) {
      if (!TRIGGER_KEYS.includes(key)) {
        expect(triggerRegistry.has(key), `${key} 手写但无 trigger，应走默认兜底`).toBe(false)
      }
    }
  })
})

describe.each(keysOfForm('scalar'))('scalar 形态 · %s', (key) => {
  const defs = naiveUiVariants[key] ?? FALLBACK_DEFS

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
  const defs = naiveUiVariants[key] ?? FALLBACK_DEFS
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
  const defs = naiveUiVariants[key] ?? FALLBACK_DEFS
  const declaredSlots = Object.keys(metaOf(key).slots ?? {})

  it.each(defs)('剧本「$label」回放终态槽集 ⊆ 声明 slots 且剧本槽不丢', (def) => {
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
})
