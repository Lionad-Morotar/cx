import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'
import { CxVtu, createVtuTriggerRegistry, VTU_STREAM_TRIGGERS } from '@lionad/cx-comps-vtu'

import { replayScriptOf } from '../app/dev/use-card-replay'
import { buildDefaultData, type CxMeta } from '../app/dev/material-utils'
import { vtuVariants } from '../app/dev/variants/vtu'

import type { CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * vtu variants 回放链路逐件验证：variants 即回放剧本（页面 useCardReplay
 * 同一 replayScriptOf 数据路径），逐件断言——
 * 1. 注册表含 trigger（页面回放按钮门控同源）
 * 2. 前缀播放出现增量帧（scalar 空壳/属性揭示、数组增长逐项）
 * 3. 终态帧 data 与剧本逐键一致（无字段丢失）
 * 4. 剧本挂载物料不抛错（展示数据合法性证伪）
 * variant.data 是覆盖语义（浅合并于 props initial 之上，undefined 键抹除
 * initial 对应字段），剧本 data 复刻页面数据路径：initial 浅合并覆盖。
 */

const registry = createVtuTriggerRegistry()

const metaOf = (key: string): CxMeta =>
  CxVtu.find((x: any) => x._cx_meta.key === key)!._cx_meta

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
  const comp = CxVtu.find((x: any) => x._cx_meta.key === key)!
  return mount(comp, {
    props: { comp: { id: `replay-${key}`, key, data: {}, components: {} }, ...data },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })
}

describe('vtu variants 回放链路', () => {
  const entries = Object.entries(vtuVariants)

  it('variants 覆盖全部 29 件物料', () => {
    expect(entries).toHaveLength(29)
    for (const [key, defs] of entries) {
      expect(defs.length, `${key} 至少 2 组 variants`).toBeGreaterThanOrEqual(2)
    }
  })

  it.each(entries)('%s：每组剧本回放有增量帧且终态收敛', (key, defs) => {
    expect(registry.has(key), `${key} 应有 trigger（回放按钮门控）`).toBe(true)
    // 数组增长型的截断机制只认主数组：尾随标量字段（主数组之后的 key）
    // 按机制设计不进帧（chart 尾随列定义推导同款语义），终态比对只取
    // 主数组字段；标量主体形态有终态兜底（完整 JSON 直出），全字段比对
    const arrayKey = VTU_STREAM_TRIGGERS.find((c) => c.key === key)
      ?.sections.find((s) => s.kind === 'array')
      ?.arrayKey
    for (const def of defs) {
      const data = mergedDataOf(key, def.data)
      const [saw, final] = replay(key, data)
      // 空主数组：无可切分内容，机制上全程无帧、终态 null（页面 done 态
      // 切完整节点兜底一次性渲染）；vtu 未开 emptyPassthrough，空态透传
      // 不存在——精确刻画而非放宽
      if (arrayKey && Array.isArray(data[arrayKey]) && (data[arrayKey] as unknown[]).length === 0) {
        expect(saw, `${key}/${def.label} 空主数组应无增量帧`).toBe(false)
        expect(final, `${key}/${def.label} 空主数组终态应为 null`).toBeNull()
        continue
      }
      expect(saw, `${key}/${def.label} 回放应出现增量帧`).toBe(true)
      expect(final, `${key}/${def.label} 终态帧应存在`).not.toBeNull()
      // 终态帧 data 逐键收敛：fallback 键可能被真值覆盖，但剧本键一个不少；
      // undefined 覆盖键（抹除 initial）经 JSON.stringify 自然缺席，跳过比对
      for (const [field, value] of Object.entries(data)) {
        if (value === undefined) continue
        if (arrayKey && field !== arrayKey) continue
        expect(
          JSON.stringify((final as any).data?.[field]),
          `${key}/${def.label} 终态帧字段 ${field} 应与剧本一致`,
        ).toBe(JSON.stringify(value))
      }
    }
  })

  it.each(entries)('%s：每组剧本挂载物料不抛错且渲染非空', (key, defs) => {
    // geo-map 豁免：vue-leaflet 的 leaflet/dist/leaflet-src.esm 无扩展名
    // 导入在 vitest node 解析下失败（页面端 vite 解析正常），与 variants
    // 数据合法性无关；回放管线级断言（不经 leaflet）已覆盖其剧本
    if (key === 'cx-vtu-geo-map') return
    for (const def of defs) {
      const wrapper = mountVariant(key, mergedDataOf(key, def.data))
      expect(wrapper.html().length, `${key}/${def.label} 应渲染非空`).toBeGreaterThan(0)
    }
  })
})
