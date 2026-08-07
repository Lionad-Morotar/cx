import { describe, expect, it } from 'vitest'

import { createEvent } from '../src/index'

/**
 * createEvent 表征测试：CxEvent 三必填工厂的行为契约。
 * 第二可选参数 id 服务剧本生成场景（chunks 逐位比对要求确定性，禁随机 id）；
 * 缺省回落 createCxID()——编辑器等运行时路径行为不变。
 */
describe('createEvent', () => {
  it('显式 id：产物用传入值，三必填齐备', () => {
    const evt = createEvent('check', 'evt-check-n1')
    expect(evt).toEqual({ id: 'evt-check-n1', key: 'check', subs: [] })
  })

  it('缺省 id：回落 createCxID 非空随机值', () => {
    const a = createEvent('detail')
    const b = createEvent('detail')
    expect(a.id).toBeTruthy()
    expect(b.id).toBeTruthy()
    expect(a.id).not.toBe(b.id)
    expect(a.key).toBe('detail')
    expect(a.subs).toEqual([])
  })

  it('key 缺省为空串（编辑器占位形态不变）', () => {
    const evt = createEvent()
    expect(evt.key).toBe('')
    expect(evt.id).toBeTruthy()
    expect(evt.subs).toEqual([])
  })
})
