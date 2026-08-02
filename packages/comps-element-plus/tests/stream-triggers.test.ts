import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { CxElementPlus } from '../src/index'
import { createEpTriggerRegistry, EP_STREAM_TRIGGERS } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 标量主体形态 4 件声明：alert/result/empty/avatar——答复内容型标量物料
 * （title/description/subTitle/src 等），收益是空壳早挂载 + 属性闭合即揭示。
 * 全部不设 skeletonFields——EP 物料 props 全带 initial 值（可选字段），
 * 列入会让 _cx_streaming 标记在完整帧终态常亮；不做 wrapper 骨架
 * （天然空态：ElAlert/ElResult/ElEmpty 空文本渲组件外壳、ElAvatar 空 src
 * 渲 fallback 图标）。
 * fallback 只给主体字段空壳值作自描述：包装层 useAttrs 平铺、渲染链路不过
 * zod、EP 内部默认值兜底，无嵌套无守卫直访链。
 * 挂载冒烟兜底：空壳帧是真实首帧，直访崩溃即生产事故，必须在此证伪。
 * 注册完备性计数契约（10 注册 + 17 不适用 = 27）在 playground 判定测试锁定，
 * 本文件只断言收录与形态，不锁总数。
 */
const SCALAR_KEYS = [
  'cx-element-plus-alert',
  'cx-element-plus-result',
  'cx-element-plus-empty',
  'cx-element-plus-avatar',
] as const

type ScalarKey = (typeof SCALAR_KEYS)[number]

const FALLBACKS: Record<ScalarKey, Record<string, unknown>> = {
  'cx-element-plus-alert': { title: '', description: '' },
  'cx-element-plus-result': { title: '', subTitle: '' },
  'cx-element-plus-empty': { description: '' },
  'cx-element-plus-avatar': { src: '', alt: '' },
}

/** 终态比对用的真实值剧本：fallback 字段被真值覆盖 + 一个 fallback 外字段透传 */
const TRANSMITTED: Record<ScalarKey, Record<string, unknown>> = {
  'cx-element-plus-alert': { title: '部署完成', description: 'v2.4 已上线', type: 'success' },
  'cx-element-plus-result': { title: '支付成功', subTitle: '订单号 20260802', icon: 'success' },
  'cx-element-plus-empty': { description: '暂无数据' },
  'cx-element-plus-avatar': { src: 'https://i.pravatar.cc/64?u=cx', alt: '头像' },
}

const materialOf = (key: string) =>
  CxElementPlus.find((x: any) => x._cx_meta.key === key)!

const configOf = (key: ScalarKey) => {
  const config = EP_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 EP_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

describe('scalar 4 件声明收录', () => {
  it('注册表覆盖全部已收录声明，4 件 scalar 在册', () => {
    const registry = createEpTriggerRegistry()
    expect(registry.size).toBe(EP_STREAM_TRIGGERS.length)
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
    const trigger = createEpTriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })

  it.each(SCALAR_KEYS)('%s：key 检出即空壳帧，fallback 保契约且无 _cx_streaming', (key) => {
    const registry = createEpTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
    const shell = extractor.next(`{"key":"${key}"`)
    expect(shell).toMatchObject({ key, data: FALLBACKS[key] })
    expect((shell as { data?: Record<string, unknown> }).data?._cx_streaming).toBeUndefined()
  })

  it.each(SCALAR_KEYS)('%s：完整 JSON 终态帧全字段一致（fallback 被真值覆盖）', (key) => {
    const registry = createEpTriggerRegistry()
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

describe('scalar 4 件空壳挂载冒烟', () => {
  it.each(SCALAR_KEYS)('%s：fallback 空壳挂载不抛错且渲染根节点', (key) => {
    // EP 包装层 useAttrs 平铺：挂载传值经 props 落入 attrs（包内既有测试同款环境），
    // 真实 EP 组件渲染（根 vite.config 已 inline 防双 vue 实例）
    const wrapper = mount(materialOf(key) as object, {
      props: {
        comp: { id: `test-${key}`, key, data: {}, components: {} },
        ...FALLBACKS[key],
      },
    })
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})

/**
 * 数组增长型 4 件声明：timeline/steps/breadcrumb/descriptions——答复内容型
 * 主数组逐项渐进（nuiv4 timeline/breadcrumb/stepper 同构先例；descriptions
 * 无 nuiv4 同构件，按同族「条目数组成组铺陈」推导）。数组截断只认主数组：
 * 尾随标量（steps.active、breadcrumb.separator）不进增量帧，随完整 JSON
 * 终态帧兜底。逐项揭示的契约是「前缀播放数组长度单调递增、首帧少于全量、
 * 终态收敛」，不锁中间帧具体截断点（截断粒度属 cx-stream 实现细节）。
 */
const ARRAY_KEYS = {
  'cx-element-plus-timeline': 'items',
  'cx-element-plus-steps': 'steps',
  'cx-element-plus-breadcrumb': 'items',
  'cx-element-plus-descriptions': 'items',
} as const

type ArrayKey = keyof typeof ARRAY_KEYS

/** 真实字段形状剧本：主数组 3 行 + 物料自带的尾随标量（随终态帧兜底） */
const ARRAY_SCRIPTS: Record<
  ArrayKey,
  { rows: Record<string, unknown>[]; trailing?: Record<string, unknown> }
> = {
  'cx-element-plus-timeline': {
    rows: [
      { content: '创建仓库', timestamp: '2026-08-01 10:00', type: 'primary' },
      { content: '首次提交', timestamp: '2026-08-01 11:00' },
      { content: '发布 v1.0', timestamp: '2026-08-02 09:00', type: 'success' },
    ],
  },
  'cx-element-plus-steps': {
    rows: [
      { title: '提交订单', description: '填写收货信息' },
      { title: '支付', description: '在线支付' },
      { title: '发货', status: 'process' },
    ],
    trailing: { active: 1 },
  },
  'cx-element-plus-breadcrumb': {
    rows: [{ label: '首页' }, { label: '物料中心' }, { label: 'Element Plus' }],
    trailing: { separator: '/' },
  },
  'cx-element-plus-descriptions': {
    rows: [
      { label: '负责人', value: '仿生狮子' },
      { label: '仓库', value: 'Lionad-Morotar/cx' },
      { label: '分支', value: 'develop', span: 2 },
    ],
  },
}

const arrayConfigOf = (key: ArrayKey) => {
  const config = EP_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 EP_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

describe('array 4 件声明收录与逐项揭示', () => {
  it.each(Object.keys(ARRAY_KEYS) as ArrayKey[])('%s：单 array 形态 + arrayKey 与物料字段一致', (key) => {
    const config = arrayConfigOf(key)
    expect(config.sections).toHaveLength(1)
    const section = config.sections[0] as { kind: string; arrayKey?: string }
    expect(section.kind).toBe('array')
    expect(section.arrayKey).toBe(ARRAY_KEYS[key])
  })

  it.each(Object.keys(ARRAY_KEYS) as ArrayKey[])('%s：注册表在册且 scanPaths 指向主数组元素', (key) => {
    const trigger = createEpTriggerRegistry().get(key)
    expect(trigger, `${key} 应在注册表内`).toBeDefined()
    expect(trigger!.scanPaths).toEqual([['data', ARRAY_KEYS[key], '*']])
  })

  it.each(Object.keys(ARRAY_KEYS) as ArrayKey[])(
    '%s：前缀播放逐项揭示，终态收敛全量且尾随标量兜底',
    (key) => {
      const arrayKey = ARRAY_KEYS[key]
      const { rows, trailing } = ARRAY_SCRIPTS[key]
      const data: Record<string, unknown> = { [arrayKey]: rows, ...trailing }
      const script = JSON.stringify({ id: `t-${key}`, key, data })
      const extractor = createIncrementalExtractor<CxSpec>({
        registry: createEpTriggerRegistry(),
        matchTrigger: matchCxTrigger,
      })
      const counts: number[] = []
      const step = Math.max(1, Math.floor(script.length / 20))
      for (let i = step; i < script.length; i += step) {
        const partial = extractor.next(script.slice(0, i)) as {
          data?: Record<string, unknown>
        } | null
        const arr = partial?.data?.[arrayKey]
        if (Array.isArray(arr)) counts.push(arr.length)
      }
      const final = extractor.next(script) as { data?: Record<string, unknown> } | null
      expect(final, '终态兜底应直出完整帧').not.toBeNull()
      const finalArr = final?.data?.[arrayKey]
      expect(Array.isArray(finalArr) ? finalArr.length : -1).toBe(rows.length)
      expect(counts.length, '应有可观察的增量窗口').toBeGreaterThan(0)
      expect(counts[0], '首帧应少于全量行数').toBeLessThan(rows.length)
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
      }
      for (const [field, value] of Object.entries(trailing ?? {})) {
        expect(
          JSON.stringify(final?.data?.[field]),
          `尾随标量 ${field} 应随终态帧兜底`,
        ).toBe(JSON.stringify(value))
      }
    },
  )
})

/**
 * 多区容器 1 件声明：card——default/header 两个内容区域槽独立揭示
 * （nuiv4 card 同构先例）。slots 取自物料定义 def._cx_meta.slots 键集，
 * 物料增删槽位时配置自动跟随；与 space 的分界是多内容区语义 vs 单槽布局壳。
 * 区域子树括号完整即揭示、未完整不渲染该区，揭示序服从剧本序列化序。
 */
describe('card region 形态 · 槽闭合揭示', () => {
  const CARD_KEY = 'cx-element-plus-card'

  it('收录：单 region 形态 + slots 取自物料定义键集', () => {
    const config = EP_STREAM_TRIGGERS.find((c) => c.key === CARD_KEY)
    expect(config, `${CARD_KEY} 未收录于 EP_STREAM_TRIGGERS`).toBeDefined()
    expect(config!.sections).toHaveLength(1)
    const section = config!.sections[0] as { kind: string; slots?: string[] }
    expect(section.kind).toBe('region')
    const metaSlots = Object.keys(materialOf(CARD_KEY)._cx_meta.slots ?? {})
    expect(section.slots).toEqual(metaSlots)
  })

  it('注册表在册且 scanPaths 逐槽指向 components 子树', () => {
    const trigger = createEpTriggerRegistry().get(CARD_KEY)
    expect(trigger, `${CARD_KEY} 应在注册表内`).toBeDefined()
    expect(trigger!.scanPaths).toEqual([
      ['components', 'default', '*'],
      ['components', 'header', '*'],
    ])
  })

  it('default 槽闭合即揭示、header 未闭合缺席；终帧两槽齐', () => {
    const script = JSON.stringify({
      id: 't-card',
      key: CARD_KEY,
      data: { shadow: 'hover' },
      components: {
        default: [{ key: 'cx-element-plus-tag', data: { text: '正文区' } }],
        header: [{ key: 'cx-element-plus-tag', data: { text: '头部区' } }],
      },
    })
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createEpTriggerRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const slotSets: string[][] = []
    const step = Math.max(1, Math.floor(script.length / 20))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as {
        components?: Record<string, unknown[]>
      } | null
      if (partial?.components && !Array.isArray(partial.components)) {
        slotSets.push(Object.keys(partial.components))
      }
    }
    const final = extractor.next(script) as {
      data?: Record<string, unknown>
      components?: Record<string, unknown[]>
    } | null
    // 存在 default 已揭示而 header 未闭合缺席的中间帧（区域独立可判）
    expect(
      slotSets.some((slots) => slots.includes('default') && !slots.includes('header')),
      '应存在 default 揭示且 header 缺席的中间帧',
    ).toBe(true)
    expect(Object.keys(final?.components ?? {})).toEqual(['default', 'header'])
    expect(final?.data?.shadow).toBe('hover')
  })
})
