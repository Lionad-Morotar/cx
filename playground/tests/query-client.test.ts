import { beforeEach, describe, expect, it, vi } from 'vitest'

// mock ofetch，隔离网络层
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

import { $fetch } from 'ofetch'
import { apiMutate, apiQuery, queryClient } from '../app/standup/utils/query-client'

const mockedFetch = vi.mocked($fetch)

// 包络契约是 apis 层与 mock server 之间的唯一约定：业务码错误 console.error 但不 reject
describe('query-client 请求出口包络契约', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('code "0" 时原样透传包络且不弹错', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: [1, 2] })
    const res = await apiQuery('/standup/list', {})
    expect(res.code).toBe('0')
    expect(res.data).toEqual([1, 2])
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('业务码非 0 时 console.error 弹错但 Promise 正常 resolve', async () => {
    mockedFetch.mockResolvedValue({ code: '400', message: '参数错误', success: false, data: null })
    const res = await apiQuery('/x')
    expect(errorSpy).toHaveBeenCalledWith('[api]', '参数错误')
    expect(res.code).toBe('400')
  })

  it('网络层失败（reject）时弹通用错误并继续 reject，且不重试', async () => {
    mockedFetch.mockRejectedValue(new Error('500 boom'))
    await expect(apiQuery('/x')).rejects.toThrow('500 boom')
    expect(errorSpy).toHaveBeenCalledWith('[api] 网络请求异常')
    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it('请求统一走 /api baseURL 且默认 POST', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: null })
    await apiQuery('/users')
    expect(mockedFetch).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ baseURL: '/api', method: 'post' }),
    )
  })

  it('并发相同 queryKey 的 apiQuery 去重为一次网络请求', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: [] })
    const [a, b] = await Promise.all([apiQuery('/labels', {}), apiQuery('/labels', {})])
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })

  it('apiMutate 不走缓存：同 url 刚被 apiQuery 取过仍实际发请求', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: null })
    await apiQuery('/standup/list', { type: 'day' })
    await apiMutate('/standup/list', { type: 'day' })
    expect(mockedFetch).toHaveBeenCalledTimes(2)
  })
})
