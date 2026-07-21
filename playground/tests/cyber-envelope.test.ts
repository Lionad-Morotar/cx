import { beforeEach, describe, expect, it, vi } from 'vitest'

// mock ofetch，隔离网络层
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

import { $fetch } from 'ofetch'
import { request } from '../app/standup/utils/cyber'

const mockedFetch = vi.mocked($fetch)

// 包络契约是 apis 层与 mock server 之间的唯一约定：业务码错误 console.error 但不 reject
describe('cyber 请求客户端包络契约', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // cyber.ts 清退 element-plus 后降级为 console.error（见 alert.ts 同策略）
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('code "0" 时原样透传包络且不弹错', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: [1, 2] })
    const res = await request({ url: '/standup/list', method: 'POST', data: {} })
    expect(res.code).toBe('0')
    expect(res.data).toEqual([1, 2])
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('业务码非 0 时 console.error 弹错但 Promise 正常 resolve', async () => {
    mockedFetch.mockResolvedValue({ code: '400', message: '参数错误', success: false, data: null })
    const res = await request({ url: '/x', method: 'POST' })
    expect(errorSpy).toHaveBeenCalledWith('[cyber]', '参数错误')
    expect(res.code).toBe('400')
  })

  it('网络层失败（reject）时弹通用错误并继续 reject', async () => {
    mockedFetch.mockRejectedValue(new Error('500 boom'))
    await expect(request({ url: '/x', method: 'POST' })).rejects.toThrow('500 boom')
    expect(errorSpy).toHaveBeenCalledWith('[cyber] 网络请求异常')
  })

  it('请求统一走 /api baseURL 且默认 POST', async () => {
    mockedFetch.mockResolvedValue({ code: '0', message: 'ok', success: true, data: null })
    await request({ url: '/users' })
    expect(mockedFetch).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ baseURL: '/api', method: 'post' }),
    )
  })
})
