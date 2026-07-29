/**
 * 站会请求出口：基于 @tanstack/vue-query 的统一客户端
 *
 * 契约（与 mock server 的线上协议，须保真遵守）：
 * - 响应包络 { code, message, success, data } 原样透传给调用方
 * - 业务码非 "0"/0 时 console.error 弹错但 Promise 正常 resolve（调用方自行判 code）
 * - 读操作 apiQuery：经 queryClient.fetchQuery，并发相同 queryKey 去重为一次请求
 * - 写操作 apiMutate：不经缓存直接发请求；写后由调用方 invalidateQueries 失效
 */
import { QueryClient } from '@tanstack/vue-query'
import { $fetch } from 'ofetch'

export interface RequestEnvelope<Data = any> {
  code: string
  message: string
  success: boolean
  data: Data
}

/**
 * 全站会共享的 QueryClient 单例：apis 层与 nuxt plugin（VueQueryPlugin）共用同一实例。
 * retry 关闭：mock 沙箱请求失败即失败，重试会改变单次尝试的失败语义并放大弹错次数；
 * staleTime 维持默认 0：mock 层数据量小，不重建持久缓存，只取请求编排（去重与失效）能力。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

async function fetchEnvelope<Data = any>(
  url: string,
  data?: object,
): Promise<RequestEnvelope<Data>> {
  const response = await $fetch<RequestEnvelope<Data>>(url, {
    baseURL: '/api',
    method: 'post',
    body: data,
  }).catch((err: unknown) => {
    // 网络层失败（5xx/断网）才走这里；业务码错误由 server 以 200 + 包络返回
    console.error('[api] 网络请求异常')
    return Promise.reject(err)
  })

  // 运行时可脏：历史后端曾混发 number 形态 code，防御性双判
  if (response.code !== '0' && (response.code as unknown) !== 0) {
    const errMsg = response?.message || '网络请求异常'
    console.error('[api]', errMsg)
  }
  return response
}

/**
 * 读操作：queryKey = [url, data]（structural hash），并发相同 key 去重；
 * staleTime 0 下不命中持久缓存，语义等同旧的直接请求
 */
export function apiQuery<Data = any>(url: string, data?: object): Promise<RequestEnvelope<Data>> {
  return queryClient.fetchQuery({
    queryKey: [url, data ?? {}],
    queryFn: () => fetchEnvelope<Data>(url, data),
  })
}

/** 写操作：不走缓存，每次实际发请求 */
export function apiMutate<Data = any>(url: string, data?: object): Promise<RequestEnvelope<Data>> {
  return fetchEnvelope<Data>(url, data)
}
