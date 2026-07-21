import { describe, expect, it } from 'vitest'

import { createCxID } from '../src/index'

/**
 * createCxID 表征测试：统一 id 生成出口的外部行为契约。
 * 断言只锁外部可观察属性（类型、格式、唯一性），不锁内部算法，
 * 未来切换 nanoid 或加前缀命名空间时只要仍满足这三条即可不改测试。
 */
describe('createCxID', () => {
  it('返回字符串', () => {
    expect(typeof createCxID()).toBe('string')
  })

  it('符合 RFC 4122 v4 uuid 格式', () => {
    // v4：第 3 段首字符为 4，第 4 段首字符属 8/9/a/b
    expect(createCxID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('连续调用产生互不相同的 id', () => {
    const ids = new Set([createCxID(), createCxID(), createCxID()])
    expect(ids.size).toBe(3)
  })
})
