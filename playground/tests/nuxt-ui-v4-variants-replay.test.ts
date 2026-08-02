import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import {
  CxNuxtUIV4,
  NUXT_UI_V4_STREAM_TRIGGERS,
  createNuxtUiV4TriggerRegistry,
} from '@lionad/cx-comps-nuxt-ui-v4'

import { buildDefaultData, buildSampleNode, type CxMeta } from '../app/dev/material-utils'
import { replayScriptOf } from '../app/dev/use-card-replay'
import { NUXT_UI_V4_OFFICIAL_KEYS } from '../app/dev/nuxt-ui-v4-categories'
import { nuxtUiV4Variants } from '../app/dev/variants/nuxt-ui-v4'
import {
  dataVariants,
  elementVariants,
  formVariants,
  layoutVariants,
  navigationVariants,
  overlayVariants,
} from '../app/dev/variants/nuxt-ui-v4'

import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * nuxt-ui-v4 手写 variants 回放链路逐件验证：variants 即回放剧本（页面
 * useCardReplay 同一 replayScriptOf + buildSampleNode 数据路径），按 trigger
 * 形态分支断言——scalar 终态帧全字段逐键一致（完整 JSON 终态兜底）；
 * array 终态帧主数组长度与剧本一致（table 空态透传组长度 0）；region 终态
 * 槽集 ⊆ 声明 slots 且剧本槽不丢（缺槽剧本按修订范式不断言等于）；
 * 组合（footer-columns）array 与 region 字段域各自收敛。
 * 数据键必须落在物料声明的 props 集内：页面 buildDefaultData 只做浅合并、
 * 不做键校验，越界键会静默落进 attrs 污染 DOM，在此静态证伪。
 * 挂载冒烟证伪展示数据合法性：空壳/真值剧本都是真实首帧，直访崩溃即
 * 生产事故（U* 组件经 vite alias 离线 stub 渲染，包内 materials.test.ts
 * 同款环境；包装层 useAttrs 平铺故经 attrs 传值）。
 */

const materials = CxNuxtUIV4 as unknown as { _cx_meta: CxMeta }[]

const metaOf = (key: string): CxMeta =>
  materials.find((x) => x._cx_meta.key === key)!._cx_meta

const componentOf = (key: string) =>
  materials.find((x) => x._cx_meta.key === key)!

/** 页面同路径剧本 data：initial 浅合并 variant 覆盖 */
function mergedDataOf(key: string, override?: Record<string, unknown>): Record<string, unknown> {
  return { ...buildDefaultData(metaOf(key)), ...(override ?? {}) }
}

const groups = [
  ['layout', layoutVariants],
  ['element', elementVariants],
  ['form', formVariants],
  ['data', dataVariants],
  ['navigation', navigationVariants],
  ['overlay', overlayVariants],
] as const

// 裁决不补的分类（如 overlay）registry 为空属合法终态，跳过避免空 suite
const nonEmptyGroups = groups.filter(([, registry]) => Object.keys(registry).length > 0)

describe.each(nonEmptyGroups)('nuxt-ui-v4 %s variants', (_group, registry) => {
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
        global: {
          provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
        },
      })
      expect(wrapper.html().length, `${key}/${def.label} 应渲染非空`).toBeGreaterThan(0)
    }
  })
})

// ---- 回放链路逐件验证（三形态分支断言） ----

const triggerRegistry = createNuxtUiV4TriggerRegistry()

/** trigger 形态归类：scalar 独占 / array / region / array+region 组合（与声明同源推导） */
function formOf(key: string): 'scalar' | 'array' | 'region' | 'combo' {
  const sections = NUXT_UI_V4_STREAM_TRIGGERS.find((c) => c.key === key)!.sections as {
    kind: string
  }[]
  const has = (kind: string) => sections.some((s) => s.kind === kind)
  if (has('scalar')) return 'scalar'
  if (has('array') && has('region')) return 'combo'
  if (has('array')) return 'array'
  return 'region'
}

const arrayKeyOf = (key: string): string =>
  (
    NUXT_UI_V4_STREAM_TRIGGERS.find((c) => c.key === key)!.sections.find(
      (s) => s.kind === 'array',
    ) as { arrayKey: string }
  ).arrayKey

const TRIGGER_KEYS = NUXT_UI_V4_STREAM_TRIGGERS.map((c) => c.key)
const keysOfForm = (form: string) => TRIGGER_KEYS.filter((k) => formOf(k) === form)

/** 页面同路径剧本节点：buildSampleNode（initial 浅合并 + default 槽示例注入） */
function scriptNodeOf(key: string, override?: Record<string, unknown>) {
  return buildSampleNode(metaOf(key), { dataOverride: override })
}

/** 逐段前缀播放，返回 [是否出现增量帧, 终态帧]（comps 先例同款节奏） */
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
  it('19 件 trigger 逐件在注册表（回放按钮门控同源）', () => {
    expect(TRIGGER_KEYS).toHaveLength(19)
    for (const key of TRIGGER_KEYS) {
      expect(triggerRegistry.has(key), `${key} 应在注册表内`).toBe(true)
    }
  })

  it('51 件非 trigger 物料逐件不在注册表（无 trigger 不回放）', () => {
    const nonTrigger = NUXT_UI_V4_OFFICIAL_KEYS.filter(
      (short) => !TRIGGER_KEYS.includes(`cx-nuxt-ui-v4-${short}`),
    )
    expect(nonTrigger).toHaveLength(51)
    for (const short of nonTrigger) {
      expect(triggerRegistry.has(`cx-nuxt-ui-v4-${short}`), `${short} 不应有 trigger`).toBe(false)
    }
  })

  it('手写 variants 恰好覆盖 18 件 trigger 物料（footer 零 props 走默认兜底）', () => {
    const handWritten = new Set(Object.keys(nuxtUiV4Variants))
    const covered = TRIGGER_KEYS.filter((k) => handWritten.has(k))
    expect(covered).toHaveLength(18)
    expect(handWritten.has('cx-nuxt-ui-v4-footer')).toBe(false)
    // 反向：手写件里的非 trigger 物料（marquee/scroll-area/link 等）不回放，无冲突
    for (const key of handWritten) {
      if (!TRIGGER_KEYS.includes(key)) {
        expect(triggerRegistry.has(key), `${key} 手写但无 trigger，应走默认兜底`).toBe(false)
      }
    }
  })
})

describe.each(keysOfForm('scalar'))('scalar 形态 · %s', (key) => {
  const defs = nuxtUiV4Variants[key]!

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
  const defs = nuxtUiV4Variants[key]!
  const arrayKey = arrayKeyOf(key)

  it.each(defs)('剧本「$label」回放终态主数组长度与剧本一致', (def) => {
    const node = scriptNodeOf(key, def.data)
    const expected = (node.data[arrayKey] as unknown[]).length
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    expect(saw, `${key}/${def.label} 回放应出现增量帧（空态透传组亦含）`).toBe(true)
    const rows = (final as { data?: Record<string, unknown> })?.data?.[arrayKey] as unknown[]
    expect(rows, `${key}/${def.label} 终态帧主数组 ${arrayKey} 应存在`).toBeDefined()
    expect(rows.length, `${key}/${def.label} 终态主数组长度应 = 剧本 ${expected}`).toBe(expected)
  })
})

describe.each(keysOfForm('region'))('region 形态 · %s', (key) => {
  // footer 零 props 无手写 variants：默认剧本（无覆盖）参与同一断言链
  const defs = nuxtUiV4Variants[key] ?? [{ label: '默认兜底', data: {} }]
  const declaredSlots = Object.keys(metaOf(key).slots ?? {})

  it.each(defs)('剧本「$label」回放终态槽集 ⊆ 声明 slots 且剧本槽不丢', (def) => {
    const node = scriptNodeOf(key, def.data)
    const scriptSlots = Object.keys((node.components as Record<string, unknown>) ?? {})
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    // 剧本含 default 槽示例（buildSampleNode 注入）→ region 扫描路径有增量帧
    expect(scriptSlots, `${key} 剧本应含 default 槽示例`).toContain('default')
    expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
    const finalSlots = Object.keys(
      ((final as { components?: Record<string, unknown> })?.components ?? {}) as Record<string, unknown>,
    )
    for (const slot of finalSlots) {
      expect(declaredSlots, `${key}/${def.label} 终态槽 ${slot} 应 ∈ 声明 slots`).toContain(slot)
    }
    for (const slot of scriptSlots) {
      expect(finalSlots, `${key}/${def.label} 剧本槽 ${slot} 终态不应丢失`).toContain(slot)
    }
  })
})

describe.each(keysOfForm('combo'))('combo 形态 · %s', (key) => {
  const defs = nuxtUiV4Variants[key]!
  const arrayKey = arrayKeyOf(key)

  it.each(defs)('剧本「$label」回放 array 与 region 字段域各自收敛', (def) => {
    const node = scriptNodeOf(key, def.data)
    const expected = (node.data[arrayKey] as unknown[]).length
    const [saw, final] = replay(node as { key: string } & Record<string, unknown>)
    // footer-columns 无 default 槽声明：剧本无 components，增量帧由 array 字段域贡献
    expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
    const rows = (final as { data?: Record<string, unknown> })?.data?.[arrayKey] as unknown[]
    expect(rows.length, `${key}/${def.label} 终态主数组长度应 = 剧本 ${expected}`).toBe(expected)
    const finalComponents = (final as { components?: Record<string, unknown> })?.components ?? {}
    expect(Object.keys(finalComponents), `${key}/${def.label} 剧本未传槽，终态应无 components`).toHaveLength(0)
  })
})
