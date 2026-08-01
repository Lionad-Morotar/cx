import { describe, expect, it } from 'vitest'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { createVtuTriggerRegistry, VTU_STREAM_TRIGGERS } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * 长主体 7 件标量主体形态声明：社媒贴文三件（post 嵌套对象）、代码三件
 * （code/patch/oldCode+newCode/stdout 长文本）、message-draft（body 长文本）。
 * fallback 保首帧空壳的物料运行时契约（渲染链路不过 zod，约束来自模板
 * 直访守卫）；skeletonFields 只列 zod 必填长字段——可选字段缺席会让
 * _cx_streaming 标记在终态常亮，code-diff/terminal 的骨架判据留给包装层。
 */
const LONG_CONTENT_KEYS = [
  'cx-vtu-x-post',
  'cx-vtu-instagram-post',
  'cx-vtu-linkedin-post',
  'cx-vtu-code-block',
  'cx-vtu-code-diff',
  'cx-vtu-terminal',
  'cx-vtu-message-draft',
] as const

const configOf = (key: string) => {
  const config = VTU_STREAM_TRIGGERS.find((c) => c.key === key)
  expect(config, `${key} 未收录于 VTU_STREAM_TRIGGERS`).toBeDefined()
  return config!
}

const scalarSectionOf = (key: string) => {
  const section = configOf(key).sections[0]
  expect(section?.kind).toBe('scalar')
  return section as { kind: 'scalar'; fallbackData?: Record<string, unknown>; skeletonFields?: string[] }
}

const shellFrame = (key: string) => {
  const registry = createVtuTriggerRegistry()
  const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
  return extractor.next(`{"key":"${key}"`)
}

/**
 * 逐字符喂累积前缀模拟真实流式，返回最后一个非空帧。
 * frameStride 10 以下一次 next() 调用为一个 delta：单字符推进到文本末尾时
 * 窗口必然到期，被节流的中间值并入到期帧，末帧即该前缀的最完整揭示。
 */
const lastFrameOf = (text: string) => {
  const registry = createVtuTriggerRegistry()
  const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
  let last: CxSpec | null = null
  for (let i = 1; i <= text.length; i++) {
    const frame = extractor.next(text.slice(0, i))
    if (frame) last = frame
  }
  return last
}

describe('长主体 7 件 scalar 声明收录', () => {
  it.each(LONG_CONTENT_KEYS)('%s：单 scalar 形态 + frameStride 10', (key) => {
    const config = configOf(key)
    expect(config.sections).toHaveLength(1)
    expect(config.sections[0]!.kind).toBe('scalar')
    expect(config.frameStride).toBe(10)
  })

  it.each(LONG_CONTENT_KEYS)('%s：注册表编译产物带闭合事件标记', (key) => {
    const trigger = createVtuTriggerRegistry().get(key)
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.scanPaths).toEqual([])
    expect(trigger?.frameStride).toBe(10)
  })
})

describe('社媒三件：post.author 结构兜底（模板无守卫直访）', () => {
  const SOCIAL_KEYS = ['cx-vtu-x-post', 'cx-vtu-instagram-post', 'cx-vtu-linkedin-post'] as const

  it.each(SOCIAL_KEYS)('%s：fallback 含 post.author 三键，skeleton 标记 post', (key) => {
    const section = scalarSectionOf(key)
    expect(section.fallbackData).toEqual({
      post: { author: { name: '', handle: '', avatarUrl: '' } },
    })
    expect(section.skeletonFields).toEqual(['post'])
  })

  it.each(SOCIAL_KEYS)('%s：key 检出即空壳帧，author 结构完整', (key) => {
    const shell = shellFrame(key)
    expect(shell).toMatchObject({
      key,
      data: {
        post: { author: { name: '', handle: '', avatarUrl: '' } },
        _cx_streaming: ['post'],
      },
    })
  })

  it('x-post 属性揭示帧：author.name 闭合即出部分 post（浅合并覆盖 fallback）', () => {
    const frame = lastFrameOf('{"key":"cx-vtu-x-post","data":{"post":{"author":{"name":"张三"')
    // 浅合并语义：transmitted.post 整体覆盖 fallback.post，未传输字段缺席
    expect(frame).toMatchObject({
      data: { post: { author: { name: '张三' } } },
    })
    expect((frame as any).data.post.author.handle).toBeUndefined()
  })
})

describe('code-block：code 必填兜底', () => {
  it('fallback code 空串，skeleton 标记 code', () => {
    const section = scalarSectionOf('cx-vtu-code-block')
    expect(section.fallbackData).toEqual({ code: '' })
    expect(section.skeletonFields).toEqual(['code'])
  })

  it('空壳帧后短属性揭示：language 闭合出帧，code 标记仍在', () => {
    expect(shellFrame('cx-vtu-code-block')).toMatchObject({
      data: { code: '', _cx_streaming: ['code'] },
    })
    const frame = lastFrameOf('{"key":"cx-vtu-code-block","data":{"language":"python"')
    expect(frame).toMatchObject({
      data: { code: '', language: 'python', _cx_streaming: ['code'] },
    })
  })
})

describe('code-diff：双模式互斥，fallback 空（wrapper 自绘判据）', () => {
  it('fallback 为空对象，不设 skeletonFields（三键全可选，标记会终态常亮）', () => {
    const section = scalarSectionOf('cx-vtu-code-diff')
    expect(section.fallbackData).toEqual({})
    expect(section.skeletonFields ?? []).toEqual([])
  })

  it('patch 剧本：patch 字符串闭合即出帧', () => {
    const frame = lastFrameOf(
      '{"key":"cx-vtu-code-diff","data":{"language":"typescript","patch":"@@ -1 +1 @@\\n-old\\n+new"',
    )
    expect(frame).toMatchObject({
      data: { language: 'typescript', patch: '@@ -1 +1 @@\n-old\n+new' },
    })
  })

  it('oldCode/newCode 剧本：两字段各自闭合逐帧揭示', () => {
    const frame = lastFrameOf(
      '{"key":"cx-vtu-code-diff","data":{"oldCode":"const x = 1","newCode":"const x = 2"',
    )
    expect(frame).toMatchObject({
      data: { oldCode: 'const x = 1', newCode: 'const x = 2' },
    })
  })
})

describe('terminal：command/exitCode 必填兜底，无骨架标记', () => {
  it('fallback command 空串 + exitCode 0，不设 skeletonFields（stdout/stderr 可选）', () => {
    const section = scalarSectionOf('cx-vtu-terminal')
    expect(section.fallbackData).toEqual({ command: '', exitCode: 0 })
    expect(section.skeletonFields ?? []).toEqual([])
  })

  it('command 闭合即揭示，stdout 流式期间物料呈现「命令已出、输出待传」', () => {
    expect(shellFrame('cx-vtu-terminal')).toMatchObject({
      data: { command: '', exitCode: 0 },
    })
    const frame = lastFrameOf('{"key":"cx-vtu-terminal","data":{"command":"pnpm install"')
    expect(frame).toMatchObject({
      data: { command: 'pnpm install', exitCode: 0 },
    })
    expect((frame as any).data._cx_streaming).toBeUndefined()
  })
})

describe('message-draft：channel 判别联合，双分支兜底', () => {
  it('fallback 覆盖 email 四键 + slack target 结构，skeleton 标记 body', () => {
    const section = scalarSectionOf('cx-vtu-message-draft')
    expect(section.fallbackData).toEqual({
      channel: 'email',
      subject: '',
      to: [],
      body: '',
      target: { type: 'channel', name: '' },
    })
    expect(section.skeletonFields).toEqual(['body'])
  })

  it('email 剧本：channel 真值覆盖 fallback，subject 闭合揭示', () => {
    const frame = lastFrameOf(
      '{"key":"cx-vtu-message-draft","data":{"channel":"email","subject":"关于下周的同步"',
    )
    expect(frame).toMatchObject({
      data: { channel: 'email', subject: '关于下周的同步', _cx_streaming: ['body'] },
    })
  })

  it('slack 剧本：channel 转 slack 后 target 以兜底结构占位（模板直访 target.type）', () => {
    const frame = lastFrameOf('{"key":"cx-vtu-message-draft","data":{"channel":"slack"')
    expect(frame).toMatchObject({
      data: { channel: 'slack', target: { type: 'channel', name: '' } },
    })
  })
})
