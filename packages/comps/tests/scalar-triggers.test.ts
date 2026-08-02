import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import {
  COMPONENTS_STREAM_TRIGGERS,
  CxBasics,
  CxUserStyle,
  createComponentsTriggerRegistry,
} from '../src/index'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 标量主体形态 9 件声明：文本/标题 7 件（content 标量）+ user-style
 * （CSS 标量）+ figure（image 对象）。收益是空壳早挂载 + 属性闭合即揭示；
 * 全部不设 skeletonFields——comps 物料包装层 defineProps 全带默认值
 * （可选字段），列入会让 _cx_streaming 标记在完整帧终态常亮。
 * fallback 只给主体字段空壳值作自描述（渲染链路不过 zod，防崩有
 * defineProps 默认值与模板守卫双保险）。
 * 挂载冒烟兜底：空壳帧是真实首帧，直访崩溃即生产事故，必须在此证伪。
 */
const TEXT_KEYS = ['cx-text', 'cx-header', 'cx-h1', 'cx-h2', 'cx-h3', 'cx-h4', 'cx-h5'] as const

const SCALAR_KEYS = [...TEXT_KEYS, 'cx-user-style', 'cx-figure'] as const

type ScalarKey = (typeof SCALAR_KEYS)[number]

const FALLBACKS: Record<ScalarKey, Record<string, unknown>> = {
  'cx-text': { content: '' },
  'cx-header': { content: '' },
  'cx-h1': { content: '' },
  'cx-h2': { content: '' },
  'cx-h3': { content: '' },
  'cx-h4': { content: '' },
  'cx-h5': { content: '' },
  'cx-user-style': { userStyle: '' },
  'cx-figure': { image: {} },
}

const allMaterials = [...CxBasics, CxUserStyle] as { _cx_meta: { key: string } }[]

const materialOf = (key: ScalarKey) => allMaterials.find((x) => x._cx_meta.key === key)!

const configOf = (key: ScalarKey) => {
  const config = COMPONENTS_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 COMPONENTS_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

const mountShell = (key: ScalarKey) => {
  // figure/user-style 的 defineProps 声明了 comp 节点（渲染器注入）；
  // 文本类未声明，多余 prop 会落 attrs 污染 DOM，按物料声明区分桩形
  const needsNode = key === 'cx-figure' || key === 'cx-user-style'
  return mount(materialOf(key) as object, {
    props: {
      ...(needsNode ? { comp: { id: `test-${key}`, key, data: {}, components: {} } } : {}),
      ...FALLBACKS[key],
    },
    global: {
      directives: { cx: { mounted() {} } },
    },
  })
}

describe('scalar 9 件声明收录', () => {
  it('注册表恰好覆盖 9 件，无遗漏无冗余', () => {
    expect(COMPONENTS_STREAM_TRIGGERS).toHaveLength(9)
    const registry = createComponentsTriggerRegistry()
    expect(registry.size).toBe(9)
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
    const trigger = createComponentsTriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })

  it.each(SCALAR_KEYS)('%s：key 检出即空壳帧，fallback 保契约且无 _cx_streaming', (key) => {
    const registry = createComponentsTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const shell = extractor.next(`{"key":"${key}"`)
    expect(shell).toMatchObject({ key, data: FALLBACKS[key] })
    expect((shell as { data?: Record<string, unknown> }).data?._cx_streaming).toBeUndefined()
  })
})

describe('scalar 9 件空壳挂载冒烟', () => {
  it.each(SCALAR_KEYS)('%s：fallback 空壳挂载不抛错且渲染根节点', (key) => {
    const wrapper = mountShell(key)
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
