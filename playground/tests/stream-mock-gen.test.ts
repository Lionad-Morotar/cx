import { describe, expect, it } from 'vitest'
import { createSpecDetector, cxSpecDetectorConfig } from '@lionad/cx-stream'

import {
  compositeChunks,
  compositeMeta,
  doubleCmptsChunks,
  doubleCmptsMeta,
} from '../app/dev/stream-mock.generated'
import { transpileCozeSpec, transpileStream } from '../scripts/stream-mock-transpile'

// 流式 mock 生成链路的两层契约：
// 1. 转译器纯函数——Coze root/elements 方言到 cx 协议的映射正确性；
// 2. 生成产物——detector 语义不变量（不锚定任何序列化风格与字符位置）。

const detector = createSpecDetector(cxSpecDetectorConfig)

describe('stream-mock 转译 · 单元', () => {
  it('DataTable：props.id 下沉为节点 id，其余字段平移为 data', () => {
    const node = transpileCozeSpec({
      root: 't1',
      elements: {
        t1: {
          type: 'DataTable',
          props: {
            id: 't1',
            columns: [{ key: 'name', label: '名称' }],
            data: [{ name: 'Alice' }],
          },
        },
      },
    })
    expect(node).toEqual({
      id: 't1',
      key: 'cx-vtu-data-table',
      data: {
        columns: [{ key: 'name', label: '名称' }],
        data: [{ name: 'Alice' }],
      },
    })
  })

  it('Chart：从 data 首行推导缺失的 xKey/series', () => {
    const node = transpileCozeSpec({
      root: 'c1',
      elements: {
        c1: {
          type: 'Chart',
          props: {
            id: 'c1',
            type: 'bar',
            data: [
              { month: '1月', online: 186, offline: 124 },
              { month: '2月', online: 200, offline: 130 },
            ],
          },
        },
      },
    })
    expect(node.key).toBe('cx-vtu-chart')
    expect(node.data?.xKey).toBe('month')
    expect(node.data?.series).toEqual([
      { key: 'online', label: 'online' },
      { key: 'offline', label: 'offline' },
    ])
  })

  it('Chart：已有 xKey 时不覆盖', () => {
    const node = transpileCozeSpec({
      root: 'c1',
      elements: {
        c1: {
          type: 'Chart',
          props: {
            id: 'c1',
            xKey: 'week',
            series: [{ key: 'a', label: 'A' }],
            data: [{ week: 'w1', a: 1 }],
          },
        },
      },
    })
    expect(node.data?.xKey).toBe('week')
    expect(node.data?.series).toEqual([{ key: 'a', label: 'A' }])
  })

  it('未知组件 type 与缺失 root 都快速失败', () => {
    expect(() =>
      transpileCozeSpec({ root: 'x', elements: { x: { type: 'BookingCard' } } }),
    ).toThrow('unknown Coze element type')
    expect(() => transpileCozeSpec({ root: 'ghost', elements: {} })).toThrow(
      'not found in elements',
    )
  })

  it('transpileStream：散文原样保留，chunks 重组等于剧本且无空块', () => {
    const content = [
      '开场散文。',
      '```json',
      JSON.stringify(
        { root: 't1', elements: { t1: { type: 'OptionList', props: { id: 't1', options: [] } } } },
        null,
        2,
      ),
      '```',
      '收尾散文。',
    ].join('\n')
    // 模拟 delta 边界：散文区一个、围栏内一个、收尾散文一个
    const proseEnd = content.indexOf('```json')
    const fenceEnd = content.indexOf('```', proseEnd + 3) + 3
    const { script, chunks, componentKeys, fenceCount } = transpileStream(content, [
      proseEnd - 2,
      proseEnd + 10,
      fenceEnd + 2,
    ])
    expect(fenceCount).toBe(1)
    expect(componentKeys).toEqual(['cx-vtu-option-list'])
    expect(script.startsWith('开场散文。\n')).toBe(true)
    expect(script.endsWith('收尾散文。')).toBe(true)
    expect(chunks.join('')).toBe(script)
    expect(chunks.every((c) => c.length > 0)).toBe(true)
    // 散文区边界平移后仍精确对应原文位置
    expect(script.slice(0, proseEnd - 2)).toBe(content.slice(0, proseEnd - 2))
  })
})

describe('stream-mock 生成产物 · 语义不变量', () => {
  const script = compositeChunks.join('')

  it('chunks 与 meta 自洽，保持原 delta 粒度', () => {
    expect(compositeChunks.length).toBe(compositeMeta.chunkCount)
    expect(compositeMeta.chunkCount).toBeGreaterThan(700)
    expect(compositeChunks.every((c) => c.length > 0)).toBe(true)
  })

  it('终态检出 success，spec 序列与 meta.componentKeys 一致', () => {
    const result = detector.extractSpecs(script)
    expect(result.status).toBe('success')
    const keys = result.specs.map((s) => (Array.isArray(s) ? s[0]?.key : s.key))
    expect(keys).toEqual([...compositeMeta.componentKeys])
    expect(keys).toHaveLength(6)
  })

  it('每个 spec 都通过 cx 协议结构校验', () => {
    const result = detector.extractSpecs(script)
    for (const spec of result.specs) {
      expect(cxSpecDetectorConfig.isValidSpec(spec)).toBe(true)
    }
  })

  it('流式中途：已完成围栏进 specs，正在流的围栏进 pendingSources', () => {
    // 播放到约 60%：前几个围栏已闭合，最后一个正在流式
    const cut = compositeChunks.slice(0, Math.floor(compositeChunks.length * 0.6)).join('')
    const mid = detector.extractSpecs(cut)
    expect(mid.status).toBe('success')
    expect(mid.specs.length).toBeGreaterThan(0)
    expect(mid.pendingSources?.length ?? 0).toBe(1)
  })

  it('doubleCmpts：双围栏顺序组件', () => {
    const result = detector.extractSpecs(doubleCmptsChunks.join(''))
    expect(result.status).toBe('success')
    expect(result.specs).toHaveLength(doubleCmptsMeta.fenceCount)
    expect(result.specs.map((s) => (Array.isArray(s) ? s[0]?.key : s.key))).toEqual([
      'cx-vtu-data-table',
      'cx-vtu-option-list',
    ])
  })
})
