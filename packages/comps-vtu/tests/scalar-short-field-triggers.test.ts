import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { CxVtu } from '../src/index'
import { createVtuTriggerRegistry, VTU_STREAM_TRIGGERS } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 短属性 7 件标量主体形态声明：audio/image/video/citation/contact-card/
 * link-preview/approval-card。收益是空壳早挂载 + 属性闭合即揭示；字段皆
 * 短值无长主体，不设 skeletonFields（骨架对短字段无意义）。fallback 保
 * 物料模板运行时的必填结构（渲染链路不过 zod）：
 * - 媒体三件 src:'' 经实证安全（image sanitize 吞空 src、audio hidden、
 *   video 空播放器框）
 * - image alt 必填（a11y 契约 min(1)），空串渲空 alt 属性无害
 * 挂载冒烟兜底四件未逐一取证模板守卫的物料：空壳帧是真实首帧，直访
 * 崩溃即生产事故，必须在此证伪。
 */
const SHORT_FIELD_KEYS = [
  'cx-vtu-audio',
  'cx-vtu-image',
  'cx-vtu-video',
  'cx-vtu-citation',
  'cx-vtu-contact-card',
  'cx-vtu-link-preview',
  'cx-vtu-approval-card',
] as const

const FALLBACKS: Record<(typeof SHORT_FIELD_KEYS)[number], Record<string, unknown>> = {
  'cx-vtu-audio': { assetId: '', src: '' },
  'cx-vtu-image': { assetId: '', src: '', alt: '' },
  'cx-vtu-video': { assetId: '', src: '' },
  'cx-vtu-citation': { href: '', title: '' },
  'cx-vtu-contact-card': { kind: 'email', value: '' },
  'cx-vtu-link-preview': { href: '' },
  'cx-vtu-approval-card': { title: '' },
}

const configOf = (key: string) => {
  const config = VTU_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 VTU_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

const mountShell = (key: (typeof SHORT_FIELD_KEYS)[number]) => {
  const comp = CxVtu.find((x: any) => x._cx_meta.key === key)!
  return mount(comp, {
    props: { comp: { id: `test-${key}`, key, data: {}, components: {} }, ...FALLBACKS[key] },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })
}

describe('短属性 7 件 scalar 声明收录', () => {
  it.each(SHORT_FIELD_KEYS)('%s：单 scalar 形态 + frameStride 10 + 无骨架标记', (key) => {
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

  it.each(SHORT_FIELD_KEYS)('%s：注册表编译产物带闭合事件标记', (key) => {
    const trigger = createVtuTriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })

  it.each(SHORT_FIELD_KEYS)('%s：key 检出即空壳帧，无 _cx_streaming', (key) => {
    const registry = createVtuTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const shell = extractor.next(`{"key":"${key}"`)
    expect(shell).toMatchObject({ key, data: FALLBACKS[key] })
    expect((shell as any).data._cx_streaming).toBeUndefined()
  })
})

describe('短属性 7 件空壳挂载冒烟', () => {
  it.each(SHORT_FIELD_KEYS)('%s：fallback 空壳挂载不抛错且渲染根节点', (key) => {
    const wrapper = mountShell(key)
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
