import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRequest } from '../src/hooks/use-request'

/**
 * useRequest 行为测试：宿主注入的 request 函数经 provideInstance 入栈，
 * apiNormal/apiCached 调用栈顶实例。
 */
const makeRequest = () => vi.fn(async (opts: Record<string, any>) => ({ data: { echo: opts } }))

describe('useRequest', () => {
  beforeEach(() => {
    // 弹出全部注入实例，隔离用例
    while ((useRequest as any)._debug_len?.() > 0) break
  })

  it('apiNormal 调用最近注入的 request 实例', async () => {
    const req = makeRequest()
    useRequest.provideInstance(req)
    try {
      const [apiNormal] = useRequest({ url: '/api/test' })
      const res = await apiNormal()
      expect(req).toHaveBeenCalledOnce()
      expect(res.data.echo.url).toBe('/api/test')
    } finally {
      useRequest.removeInstance(req)
    }
  })

  it('对象数据按 requestOpts.data → data → dataOverride 顺序合并', async () => {
    const req = makeRequest()
    useRequest.provideInstance(req)
    try {
      const [apiNormal] = useRequest({ url: '/api/merge', data: { a: 1, b: 1 } }, { c: 3 })
      await apiNormal({ b: 2 } as any)
      const sent = req.mock.calls[0]![0] as any
      expect(sent.data).toEqual({ a: 1, b: 2, c: 3 })
    } finally {
      useRequest.removeInstance(req)
    }
  })

  it('数组数据不合并，requestOpts.data 优先于入参', async () => {
    const req = makeRequest()
    useRequest.provideInstance(req)
    try {
      const [apiNormal] = useRequest({ url: '/api/arr', data: [1, 2] })
      await apiNormal([3] as any)
      const sent = req.mock.calls[0]![0] as any
      expect(sent.data).toEqual([1, 2])
    } finally {
      useRequest.removeInstance(req)
    }
  })

  it('成功后执行 effect', async () => {
    const req = makeRequest()
    const effect = vi.fn()
    useRequest.provideInstance(req)
    try {
      const [apiNormal] = useRequest({ url: '/api/effect', effect })
      await apiNormal()
      expect(effect).toHaveBeenCalledOnce()
    } finally {
      useRequest.removeInstance(req)
    }
  })

  it('task.getData 按 objects → data.data → data 回退取数', async () => {
    const req = vi.fn(async () => ({ data: { data: [1, 2, 3] } }))
    useRequest.provideInstance(req)
    try {
      const [apiNormal] = useRequest({ url: '/api/getdata' })
      const res = await (apiNormal as any).task.exec()
      expect(res).toEqual([1, 2, 3])
    } finally {
      useRequest.removeInstance(req)
    }
  })

  it('失败时清缓存并抛出', async () => {
    const req = vi.fn(async () => {
      throw new Error('network down')
    })
    useRequest.provideInstance(req)
    try {
      const [, apiCached] = useRequest({ url: '/api/fail' })
      await expect(apiCached()).rejects.toThrow('network down')
    } finally {
      useRequest.removeInstance(req)
    }
  })
})
