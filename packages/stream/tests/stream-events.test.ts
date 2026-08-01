import { describe, expect, it } from 'vitest'
import { furthestEvent, scanStreamEvents } from '../src/core/stream-events'

import type { ScanMatch } from '../src/core/types'

const paths = (events: ScanMatch[]) => events.map((e) => e.path)

describe('scanStreamEvents 字符串属性闭合', () => {
  it('key 字符串闭合即首个事件（早挂载锚点）', () => {
    const r = scanStreamEvents('{"key":"cx-vtu-article","data":{"type":"md","content":"## 概述')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'type']])
  })

  it('字符串 value 流式中 = leaf（带已积累内容）', () => {
    const r = scanStreamEvents('{"key":"k","data":{"content":"## 概述\n\n正')
    expect(r.leaf).toEqual({ path: ['data', 'content'], kind: 'string', partial: '## 概述\n\n正' })
  })

  it('content 闭合后事件推进，下一属性成为新 leaf（路径变迁信号同源）', () => {
    const r = scanStreamEvents('{"key":"k","data":{"content":"正文","title":"Schema 驱')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'content']])
    expect(r.leaf?.path).toEqual(['data', 'title'])
  })

  it('属性名未闭合（mid-key）：leaf 退化为所在容器路径，不产生闭合', () => {
    const r = scanStreamEvents('{"key":"k","data":{"title":"abc","tit')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'title']])
    expect(r.leaf?.path).toEqual(['data'])
  })

  it('key 与冒号间任意空白不影响判别', () => {
    const r = scanStreamEvents('{ "key" : "k" , "data" : { "title" : "x" } }')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'title']])
  })
})

describe('scanStreamEvents 原始值闭合推断', () => {
  it('数字值由逗号收尾，半截数字是 leaf 不产事件', () => {
    const r = scanStreamEvents('{"key":"k","data":{"rate":4.5,"readingTime":3')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'rate']])
    expect(r.leaf).toEqual({ path: ['data', 'readingTime'], kind: 'primitive', partial: '3' })
  })

  it('末位属性无逗号：由 } 收尾（纯逗号检测的盲区）', () => {
    const r = scanStreamEvents('{"key":"k","data":{"rate":4.5}}')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'rate']])
  })

  it('布尔 / null 同样由界符推断', () => {
    const r = scanStreamEvents('{"key":"k","data":{"flag":true,"note":null}}')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'flag'], ['data', 'note']])
  })

  it('界符前空白不污染值末位置', () => {
    const r = scanStreamEvents('{"key":"k","data":{"rate":4.5 ,"x":1}}')
    const rate = r.closures.find((e) => e.path.join('/') === 'data/rate')
    expect(rate).toBeDefined()
    // end 指向值末字符 '5' 而非空白或逗号
    expect('{"key":"k","data":{"rate":4.5 ,"x":1}}'[rate!.end]).toBe('5')
  })
})

describe('scanStreamEvents 字符串项数组逐项事件', () => {
  it('逐项闭合 + 容器闭合同时可得', () => {
    const r = scanStreamEvents('{"key":"k","data":{"tags":["vue","low-code"],"rate":4}}')
    expect(paths(r.closures)).toEqual([
      ['key'],
      ['data', 'tags', 0],
      ['data', 'tags', 1],
      ['data', 'rate'],
    ])
    expect(paths(r.containers)).toContainEqual(['data', 'tags'])
  })

  it('第二项流式中：仅第一项闭合，第二项为带索引 leaf', () => {
    const r = scanStreamEvents('{"key":"k","data":{"tags":["vue","low')
    expect(paths(r.closures).slice(1)).toEqual([['data', 'tags', 0]])
    expect(r.leaf).toEqual({ path: ['data', 'tags', 1], kind: 'string', partial: 'low' })
  })

  it('数组中的原始值项逐项推断', () => {
    const r = scanStreamEvents('{"key":"k","data":{"rates":[1,2.5,3]}}')
    expect(paths(r.closures).slice(1)).toEqual([
      ['data', 'rates', 0],
      ['data', 'rates', 1],
      ['data', 'rates', 2],
    ])
  })
})

describe('scanStreamEvents 容器闭合（scanBalancedItems 全量版语义）', () => {
  it('对象值字段与嵌套容器按文本序产出', () => {
    const r = scanStreamEvents('{"key":"k","data":{"author":{"name":"L"},"tags":["a"]}}')
    expect(paths(r.containers)).toEqual([['data', 'author'], ['data', 'tags'], ['data']])
  })

  it('根数组：顶层元素以索引为首段路径', () => {
    const r = scanStreamEvents('[{"key":"a","data":{"x":1}},{"key":"b"')
    // "b" 冒号后值位置 EOF 闭合：值完整，产事件（与 key 位置的角色未决区分）
    expect(paths(r.closures)).toEqual([[0, 'key'], [0, 'data', 'x'], [1, 'key']])
    expect(paths(r.containers)).toContainEqual([0, 'data'])
  })

  it('根容器自身不产事件', () => {
    const r = scanStreamEvents('{"key":"k"}')
    expect(r.containers).toEqual([])
  })
})

describe('scanStreamEvents 转义与干扰字符', () => {
  it('字符串内逗号不干扰（朴素逗号检测反例）', () => {
    const r = scanStreamEvents('{"key":"k","data":{"content":"a,b"}}')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'content']])
  })

  it('转义引号 + 逗号组合仍精确', () => {
    const r = scanStreamEvents('{"key":"k","data":{"content":"说\\"你好,世界\\"好吗","done":1}}')
    expect(paths(r.closures)).toEqual([['key'], ['data', 'content'], ['data', 'done']])
  })

  it('末尾孤立转义反斜杠视为字符串未闭合', () => {
    const r = scanStreamEvents('{"key":"k","data":{"content":"abc\\')
    expect(paths(r.closures)).toEqual([['key']])
    expect(r.leaf?.kind).toBe('string')
  })
})

describe('furthestEvent', () => {
  it('空事件 → null', () => {
    expect(furthestEvent({ closures: [], containers: [], leaf: null })).toBeNull()
  })

  it('标量与容器取文本位置最前者', () => {
    const r = scanStreamEvents('{"key":"k","data":{"author":{"name":"L"},"title":"x')
    // 最远 = author 容器闭合（在 title 流式中之前）
    expect(furthestEvent(r)?.path).toEqual(['data', 'author'])
  })

  it('字符串恰好闭合在文本末尾：角色未决不产事件（防截断在裸 key 上）', () => {
    const r = scanStreamEvents('{"key":"k","data":{"title"')
    expect(paths(r.closures)).toEqual([['key']])
    expect(r.leaf).toBeNull()
    // 界符到达后重扫：正常判别为 value 闭合
    const r2 = scanStreamEvents('{"key":"k","data":{"title":"x"}')
    expect(paths(r2.closures)).toEqual([['key'], ['data', 'title']])
  })

  it('值位置字符串恰好闭合在文本末尾：值完整产事件（空壳挂载锚点）', () => {
    // key 检出即空壳帧的正面对照：组件 key 值完整闭合即最早揭示点
    const r = scanStreamEvents('{"key":"cx-vtu-article"')
    expect(paths(r.closures)).toEqual([['key']])
    expect(r.leaf).toBeNull()
    // 数组项位置同理
    const r2 = scanStreamEvents('{"key":"k","data":{"tags":["vue"')
    expect(paths(r2.closures)).toEqual([['key'], ['data', 'tags', 0]])
  })

  it('end 随文本推进单调不减（截断点竞争的前置不变量）', () => {
    const prefixes = [
      '{"key":"k","data":{"a":"1"',
      '{"key":"k","data":{"a":"1","b":"2"',
      '{"key":"k","data":{"a":"1","b":"2","c":[3]}',
    ]
    const ends = prefixes.map((p) => furthestEvent(scanStreamEvents(p))!.end)
    expect(ends[1]).toBeGreaterThan(ends[0]!)
    expect(ends[2]).toBeGreaterThan(ends[1]!)
  })
})
