import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { CxNaiveUi } from '../src/index'
import { NAIVE_UI_STREAM_TRIGGERS, createNaiveUiTriggerRegistry } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 标量主体形态 5 件声明：alert/result/empty/avatar/statistic——答复内容型
 * 标量物料（title/content/description/src/label+value），收益是空壳早挂载 + 属性闭合即揭示。
 * 全部不设 skeletonFields——naive 物料 props 全带 initial 值（可选字段），
 * 列入会让 _cx_streaming 标记在完整帧终态常亮；不做 wrapper 骨架
 * （天然空态：空内容时 N* 仍渲组件外壳或默认占位）。
 * fallback 只给主体字段空壳值作自描述：包装层 useAttrs 平铺、渲染链路不过
 * zod、N 组件内部默认值兜底，直访带守卫（alert content computed `?? ''`），
 * 嵌套无守卫直访链不存在。
 * 挂载冒烟兜底：空壳帧是真实首帧，直访崩溃即生产事故，必须在此证伪
 * （N* 真组件挂载，materials.test.ts 同款环境）。
 */
const SCALAR_KEYS = [
  'cx-naive-ui-alert',
  'cx-naive-ui-result',
  'cx-naive-ui-empty',
  'cx-naive-ui-avatar',
  'cx-naive-ui-statistic',
] as const

type ScalarKey = (typeof SCALAR_KEYS)[number]

const FALLBACKS: Record<ScalarKey, Record<string, unknown>> = {
  'cx-naive-ui-alert': { title: '', content: '' },
  'cx-naive-ui-result': { title: '', description: '' },
  'cx-naive-ui-empty': { description: '' },
  'cx-naive-ui-avatar': { src: '' },
  'cx-naive-ui-statistic': { label: '', value: '' },
}

/** 终态比对用的真实值剧本：fallback 字段被真值覆盖 + 一个 fallback 外字段透传 */
const TRANSMITTED: Record<ScalarKey, Record<string, unknown>> = {
  'cx-naive-ui-alert': { title: '部署完成', content: 'v2.4 已上线', type: 'success' },
  'cx-naive-ui-result': { status: 'success', title: '支付成功', description: '订单已提交处理' },
  'cx-naive-ui-empty': { description: '调整筛选条件后重试', size: 'large' },
  'cx-naive-ui-avatar': { src: 'https://i.pravatar.cc/64?u=cx', round: true },
  'cx-naive-ui-statistic': { label: '下载量', value: '1,024,034', tabularNums: true },
}

const materialOf = (key: ScalarKey) => CxNaiveUi.find((x: any) => x._cx_meta.key === key)!

const configOf = (key: ScalarKey) => {
  const config = NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 NAIVE_UI_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

describe('scalar 5 件声明收录', () => {
  it('注册表恰好覆盖 12 件（array 6 + scalar 5 + region 1），无遗漏无冗余', () => {
    expect(NAIVE_UI_STREAM_TRIGGERS).toHaveLength(12)
    const registry = createNaiveUiTriggerRegistry()
    expect(registry.size).toBe(12)
    for (const key of SCALAR_KEYS) {
      expect(registry.has(key), `${key} 应在注册表内`).toBe(true)
    }
  })

  it.each(SCALAR_KEYS)('%s：单 scalar 形态 + frameStride 10 + 无骨架标记', (key) => {
    const config = configOf(key)
    expect(config.sections).toHaveLength(1)
    const section = config.sections[0] as {
      kind: string
      fallbackData?: Record<string, unknown>
      skeletonFields?: string[]
    }
    expect(section.kind).toBe('scalar')
    expect(section.fallbackData).toEqual(FALLBACKS[key])
    expect(section.skeletonFields ?? []).toEqual([])
    expect(config.frameStride).toBe(10)
  })

  it.each(SCALAR_KEYS)('%s：注册表编译产物带闭合事件标记', (key) => {
    const trigger = createNaiveUiTriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })

  it.each(SCALAR_KEYS)('%s：key 检出即空壳帧，fallback 保契约且无 _cx_streaming', (key) => {
    const registry = createNaiveUiTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const shell = extractor.next(`{"key":"${key}"`)
    expect(shell).toMatchObject({ key, data: FALLBACKS[key] })
    expect((shell as { data?: Record<string, unknown> }).data?._cx_streaming).toBeUndefined()
  })

  it.each(SCALAR_KEYS)('%s：完整 JSON 终态帧全字段一致（fallback 被真值覆盖）', (key) => {
    const registry = createNaiveUiTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const transmitted = TRANSMITTED[key]
    const script = JSON.stringify({ id: `t-${key}`, key, data: transmitted }, null, 2)
    const final = extractor.next(script) as { data?: Record<string, unknown> } | null
    expect(final, '终态兜底应直出完整帧').not.toBeNull()
    for (const [field, value] of Object.entries(transmitted)) {
      expect(JSON.stringify(final?.data?.[field]), `终态帧字段 ${field} 应与剧本一致`).toBe(
        JSON.stringify(value),
      )
    }
    expect(final?.data?._cx_streaming).toBeUndefined()
  })
})

describe('scalar 5 件空壳挂载冒烟', () => {
  it.each(SCALAR_KEYS)('%s：fallback 空壳挂载不抛错且渲染根节点', (key) => {
    // 包装层无 defineProps：mount 的 props 传值落到 attrs（materials.test.ts 同款链路），
    // comp 为 cx 运行时节点桩，桥接层负责剥离
    const comp = materialOf(key)
    const wrapper = mount(comp as object, {
      props: {
        comp: { id: `test-${key}`, key, data: {}, components: {} },
        ...FALLBACKS[key],
      },
    })
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
