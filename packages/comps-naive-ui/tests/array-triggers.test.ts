import { describe, expect, it } from 'vitest'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { NAIVE_UI_STREAM_TRIGGERS, createNaiveUiTriggerRegistry } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 数组增长型 6 件声明：data-table（既有，data 行数组 + columns 次增长路径）
 * 与 collapse/steps/timeline/breadcrumb/descriptions（内容条目数组逐项揭示）。
 * arrayKey 逐件与物料 index.ts props 核对：steps 的主数组字段是 steps，其余四件是 items。
 * 尾随标量（accordion/active/title/size 等）序列化在主数组之后时不进增量帧，
 * 交完整帧兜底；空主数组无可切分边界，全程无帧、终态 null（未开 emptyPassthrough）。
 */
const ARRAY_KEYS = [
  'cx-naive-ui-collapse',
  'cx-naive-ui-steps',
  'cx-naive-ui-timeline',
  'cx-naive-ui-breadcrumb',
  'cx-naive-ui-descriptions',
  'cx-naive-ui-data-table',
] as const

type ArrayKey = (typeof ARRAY_KEYS)[number]

/** 逐件核对的 arrayKey：steps 为 steps，其余为 items；data-table 为 data（既有） */
const ARRAY_FIELD: Record<ArrayKey, string> = {
  'cx-naive-ui-collapse': 'items',
  'cx-naive-ui-steps': 'steps',
  'cx-naive-ui-timeline': 'items',
  'cx-naive-ui-breadcrumb': 'items',
  'cx-naive-ui-descriptions': 'items',
  'cx-naive-ui-data-table': 'data',
}

/** 各物料主数组的单项样本（内容条目形态与物料 initial 同构） */
const ITEM_SAMPLE: Record<ArrayKey, Record<string, unknown>[]> = {
  'cx-naive-ui-collapse': [
    { title: '第一章', content: '第一章的正文内容' },
    { title: '第二章', content: '第二章的正文内容' },
    { title: '第三章', content: '第三章的正文内容' },
  ],
  'cx-naive-ui-steps': [
    { title: '填写信息', description: '填写基本信息' },
    { title: '确认提交', description: '核对后提交' },
    { title: '完成', description: '等待处理结果' },
  ],
  'cx-naive-ui-timeline': [
    { title: '创建任务', content: '任务已创建', time: '2026-07-30', type: 'success' },
    { title: '处理中', content: '正在处理', time: '2026-07-31', type: 'info' },
    { title: '完成', content: '处理完毕', time: '2026-08-01', type: 'success' },
  ],
  'cx-naive-ui-breadcrumb': [{ title: '首页' }, { title: '列表' }, { title: '详情' }],
  'cx-naive-ui-descriptions': [
    { label: '姓名', value: '张三' },
    { label: '城市', value: '上海' },
    { label: '职位', value: '工程师' },
  ],
  'cx-naive-ui-data-table': [
    { name: '张三', age: 28 },
    { name: '李四', age: 32 },
    { name: '王五', age: 24 },
  ],
}

const configOf = (key: ArrayKey) => {
  const config = NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 NAIVE_UI_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

const nodeOf = (key: ArrayKey, rows: Record<string, unknown>[]) =>
  JSON.stringify({ id: `t-${key}`, key, data: { [ARRAY_FIELD[key]]: rows } })

/** 逐字符喂累积前缀模拟真实流式，返回所有非空帧 */
const framesOf = (text: string) => {
  const registry = createNaiveUiTriggerRegistry()
  const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
  const frames: CxSpec[] = []
  for (let i = 1; i <= text.length; i++) {
    const frame = extractor.next(text.slice(0, i))
    if (frame) frames.push(frame)
  }
  return frames
}

describe('array 6 件声明收录', () => {
  it('array 形态配置恰好 6 件（5 新增 + data-table 既有），无遗漏无冗余', () => {
    // 按形态维度自洽断言：scalar/region 注入不使本测试变红（nuiv4 计数断言判例）
    const arrayConfigs = NAIVE_UI_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'array'),
    )
    expect(arrayConfigs).toHaveLength(6)
    const registry = createNaiveUiTriggerRegistry()
    for (const key of ARRAY_KEYS) {
      expect(registry.has(key), `${key} 应在注册表内`).toBe(true)
    }
  })

  it.each(ARRAY_KEYS)('%s：单 array 形态 + arrayKey 逐件核对', (key) => {
    const config = configOf(key)
    const arraySections = config.sections.filter((s) => s.kind === 'array')
    expect(arraySections).toHaveLength(1)
    expect(arraySections[0]).toMatchObject({ arrayKey: ARRAY_FIELD[key] })
  })
})

describe('array 逐项揭示帧', () => {
  it.each(ARRAY_KEYS)('%s：主数组逐项增长出帧，截断落在元素边界', (key) => {
    const rows = ITEM_SAMPLE[key]
    const field = ARRAY_FIELD[key]
    const frames = framesOf(nodeOf(key, rows))
    expect(frames.length, `${key} 应出现增量帧`).toBeGreaterThan(0)
    // 增量帧的主数组长度应单调增长且不超过样本长度（逐项揭示）
    const lengths = frames.map((frame) => {
      const data = (frame as { data?: Record<string, unknown> }).data
      return Array.isArray(data?.[field]) ? (data[field] as unknown[]).length : -1
    })
    for (const len of lengths) {
      expect(len, `${key} 增量帧主数组应已切分`).toBeGreaterThanOrEqual(0)
    }
    const lastLen = lengths[lengths.length - 1]
    expect(lastLen, `${key} 终态帧主数组应收敛到样本长度`).toBe(rows.length)
    // 逐项揭示语义：增量帧主数组长度单调非降（外部审查指出的名实相符编码）
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i], `${key} 第 ${i} 帧不应倒退`).toBeGreaterThanOrEqual(lengths[i - 1]!)
    }
  })
})

describe('array 尾随标量与空主数组', () => {
  it('collapse：尾随标量 accordion 不进增量帧', () => {
    // accordion 序列化在 items 之后：增量帧只认主数组，尾随标量交完整帧
    const text = JSON.stringify({
      id: 't-trailing',
      key: 'cx-naive-ui-collapse',
      data: { items: ITEM_SAMPLE['cx-naive-ui-collapse'], accordion: true },
    })
    const frames = framesOf(text)
    expect(frames.length).toBeGreaterThan(0)
    for (const frame of frames) {
      const data = (frame as { data?: Record<string, unknown> }).data
      expect(data?.accordion, '尾随标量不应进增量帧').toBeUndefined()
    }
  })

  it.each(ARRAY_KEYS)('%s：空主数组全程无帧、终态 null（未开 emptyPassthrough）', (key) => {
    const frames = framesOf(nodeOf(key, []))
    expect(frames, `${key} 空主数组不应出帧`).toHaveLength(0)
  })
})
