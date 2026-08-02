import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import {
  CxNuxtUIV4,
  NUXT_UI_V4_STREAM_TRIGGERS,
  createNuxtUiV4TriggerRegistry,
} from '../src/index'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 标量主体形态 6 件声明：alert/avatar/banner/empty/error/user——答复内容型
 * 标量物料（title/description/src/name 等），收益是空壳早挂载 + 属性闭合即揭示。
 * 全部不设 skeletonFields——nuiv4 物料 props 全带 initial 值（可选字段），
 * 列入会让 _cx_streaming 标记在完整帧终态常亮；不做 wrapper 骨架
 * （天然空态：空内容时 U* 仍渲组件外壳或 fallback 图标）。
 * fallback 只给主体字段空壳值作自描述：包装层 useAttrs 平铺、渲染链路不过
 * zod、Nuxt UI 内部默认值兜底，无嵌套无守卫直访链。
 * 挂载冒烟兜底：空壳帧是真实首帧，直访崩溃即生产事故，必须在此证伪
 * （U* 组件经 vite alias 离线 stub 渲染，见 materials.test.ts 同款环境）。
 */
const SCALAR_KEYS = [
  'cx-nuxt-ui-v4-alert',
  'cx-nuxt-ui-v4-avatar',
  'cx-nuxt-ui-v4-banner',
  'cx-nuxt-ui-v4-empty',
  'cx-nuxt-ui-v4-error',
  'cx-nuxt-ui-v4-user',
] as const

type ScalarKey = (typeof SCALAR_KEYS)[number]

const FALLBACKS: Record<ScalarKey, Record<string, unknown>> = {
  'cx-nuxt-ui-v4-alert': { title: '', description: '' },
  'cx-nuxt-ui-v4-avatar': { src: '', alt: '', text: '' },
  'cx-nuxt-ui-v4-banner': { title: '' },
  'cx-nuxt-ui-v4-empty': { title: '', description: '' },
  'cx-nuxt-ui-v4-error': { statusMessage: '', message: '' },
  'cx-nuxt-ui-v4-user': { name: '', description: '', avatarSrc: '' },
}

/** 终态比对用的真实值剧本：fallback 字段被真值覆盖 + 一个 fallback 外字段透传 */
const TRANSMITTED: Record<ScalarKey, Record<string, unknown>> = {
  'cx-nuxt-ui-v4-alert': { title: '部署完成', description: 'v2.4 已上线', color: 'success' },
  'cx-nuxt-ui-v4-avatar': { src: 'https://i.pravatar.cc/64?u=cx', alt: '头像', text: '狮' },
  'cx-nuxt-ui-v4-banner': { title: '系统维护预告', color: 'warning' },
  'cx-nuxt-ui-v4-empty': { title: '暂无数据', description: '调整筛选条件后重试' },
  'cx-nuxt-ui-v4-error': { statusCode: 404, statusMessage: '页面不存在', message: '检查链接' },
  'cx-nuxt-ui-v4-user': { name: '仿生狮子', description: '全栈工程师', avatarSrc: 'https://i.pravatar.cc/64?u=lionad' },
}

const materialOf = (key: ScalarKey) =>
  CxNuxtUIV4.find((x: any) => x._cx_meta.key === key)!

const configOf = (key: ScalarKey) => {
  const config = NUXT_UI_V4_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 NUXT_UI_V4_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

describe('scalar 6 件声明收录', () => {
  it('注册表恰好覆盖 19 件（array 8 + region 4 + 组合 1 + scalar 6），无遗漏无冗余', () => {
    expect(NUXT_UI_V4_STREAM_TRIGGERS).toHaveLength(19)
    const registry = createNuxtUiV4TriggerRegistry()
    expect(registry.size).toBe(19)
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
    const trigger = createNuxtUiV4TriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })

  it.each(SCALAR_KEYS)('%s：key 检出即空壳帧，fallback 保契约且无 _cx_streaming', (key) => {
    const registry = createNuxtUiV4TriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const shell = extractor.next(`{"key":"${key}"`)
    expect(shell).toMatchObject({ key, data: FALLBACKS[key] })
    expect((shell as { data?: Record<string, unknown> }).data?._cx_streaming).toBeUndefined()
  })

  it.each(SCALAR_KEYS)('%s：完整 JSON 终态帧全字段一致（fallback 被真值覆盖）', (key) => {
    const registry = createNuxtUiV4TriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const transmitted = TRANSMITTED[key]
    const script = JSON.stringify({ id: `t-${key}`, key, data: transmitted }, null, 2)
    const final = extractor.next(script) as { data?: Record<string, unknown> } | null
    expect(final, '终态兜底应直出完整帧').not.toBeNull()
    for (const [field, value] of Object.entries(transmitted)) {
      expect(
        JSON.stringify(final?.data?.[field]),
        `终态帧字段 ${field} 应与剧本一致`,
      ).toBe(JSON.stringify(value))
    }
    expect(final?.data?._cx_streaming).toBeUndefined()
  })
})

describe('scalar 6 件空壳挂载冒烟', () => {
  it.each(SCALAR_KEYS)('%s：fallback 空壳挂载不抛错且渲染根节点', (key) => {
    // 包装层 useAttrs 平铺：挂载经 attrs 传值（materials.test.ts 同款环境），
    // U* 离线 stub 渲染 div.u-stub-* 根节点
    const wrapper = mount(materialOf(key) as object, {
      attrs: { ...FALLBACKS[key] },
      global: {
        provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
      },
    })
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
