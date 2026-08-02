import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'
import {
  COMPONENTS_STREAM_TRIGGERS,
  CxBasics,
  CxCalendar,
  CxGrid,
  CxPage,
  CxUserStyle,
  createComponentsTriggerRegistry,
} from '@lionad/cx-comps'

import { replayScriptOf } from '../app/dev/use-card-replay'
import { buildDefaultData, type CxMeta } from '../app/dev/material-utils'
import { compsVariants } from '../app/dev/variants/comps'

import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * comps variants 回放链路逐件验证：variants 即回放剧本（页面 useCardReplay
 * 同一 replayScriptOf 数据路径），逐件断言——
 * 1. 注册表含 trigger（页面回放按钮门控同源）
 * 2. 前缀播放出现增量帧（scalar 空壳挂载 + 属性揭示）
 * 3. 终态帧 data 与剧本逐键一致（scalar 有完整 JSON 终态兜底，全字段比对）
 * 4. 剧本挂载物料不抛错（展示数据合法性证伪）
 * comps 手写 variants 恰好覆盖 scalar 适用的 9 件（容器/headless/calendar
 * 判定不适用走默认兜底、无 trigger 不回放），两清单在此双向锁定同源。
 */

const registry = createComponentsTriggerRegistry()

const allMaterials = [...CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle] as {
  _cx_meta: CxMeta
}[]

const metaOf = (key: string): CxMeta => allMaterials.find((x) => x._cx_meta.key === key)!._cx_meta

/** 页面同路径剧本 data：initial 浅合并 variant 覆盖（嵌套数组整替不深合） */
function mergedDataOf(key: string, override?: Record<string, unknown>): Record<string, unknown> {
  return { ...buildDefaultData(metaOf(key)), ...(override ?? {}) }
}

/** 逐段前缀播放，返回 [是否出现增量帧, 终态帧] */
function replay(key: string, data: Record<string, unknown>): [boolean, CxStreamNode | null] {
  const script = replayScriptOf({ key, data })
  const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
  let saw = false
  const step = Math.max(1, Math.floor(script.length / 40))
  for (let i = step; i < script.length; i += step) {
    if (extractor.next(script.slice(0, i))) saw = true
  }
  return [saw, extractor.next(script) as CxStreamNode | null]
}

function mountVariant(key: string, data: Record<string, unknown>) {
  const comp = allMaterials.find((x) => x._cx_meta.key === key)!
  // figure/user-style 的 defineProps 声明了 comp 节点（渲染器注入）；
  // 文本类未声明，多余 prop 会落 attrs 污染 DOM，按物料声明区分桩形
  const needsNode = key === 'cx-figure' || key === 'cx-user-style'
  return mount(comp as object, {
    props: {
      ...(needsNode ? { comp: { id: `replay-${key}`, key, data: {}, components: {} } } : {}),
      ...data,
    },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })
}

describe('comps variants 回放链路', () => {
  const entries = Object.entries(compsVariants)

  it('手写 variants 恰好覆盖 scalar 适用的 9 件，两清单同源', () => {
    expect(entries).toHaveLength(9)
    for (const [key, defs] of entries) {
      expect(defs.length, `${key} 至少 2 组 variants`).toBeGreaterThanOrEqual(2)
    }
    // 双向锁定：variants 登记 key 与 trigger 声明 key 集合相等——
    // 深化遗漏（有 trigger 无剧本）或失效登记（有剧本无 trigger）都在此暴露
    const variantKeys = entries.map(([key]) => key).sort()
    const triggerKeys = COMPONENTS_STREAM_TRIGGERS.map((c) => c.key).sort()
    expect(variantKeys).toEqual(triggerKeys)
  })

  it.each(entries)('%s：每组剧本回放有增量帧且终态收敛', (key, defs) => {
    expect(registry.has(key), `${key} 应有 trigger（回放按钮门控）`).toBe(true)
    for (const def of defs) {
      const data = mergedDataOf(key, def.data)
      const [saw, final] = replay(key, data)
      expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
      expect(final, `${key}/${def.label} 终态帧应存在`).not.toBeNull()
      // 终态帧 data 逐键收敛：fallback 键可能被真值覆盖，但剧本键一个不少；
      // undefined 覆盖键（抹除 initial）经 JSON.stringify 自然缺席，跳过比对
      for (const [field, value] of Object.entries(data)) {
        if (value === undefined) continue
        expect(
          JSON.stringify((final as { data?: Record<string, unknown> }).data?.[field]),
          `${key}/${def.label} 终态帧字段 ${field} 应与剧本一致`,
        ).toBe(JSON.stringify(value))
      }
    }
  })

  it.each(entries)('%s：每组剧本挂载物料不抛错且渲染非空', (key, defs) => {
    for (const def of defs) {
      const wrapper = mountVariant(key, mergedDataOf(key, def.data))
      expect(wrapper.html().length, `${key}/${def.label} 应渲染非空`).toBeGreaterThan(0)
    }
  })
})
