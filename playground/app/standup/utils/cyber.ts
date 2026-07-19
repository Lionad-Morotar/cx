/**
 * 站会请求客户端：mock 环境下的统一入口
 *
 * 契约（与旧实现保真，业务代码零感知）：
 * - 响应包络 { code, message, success, data } 原样透传给调用方
 * - 业务码非 "0"/0 时 ElMessage 弹错但 Promise 正常 resolve（调用方自行判 code）
 * - request(url, method?, data?) 默认 POST；也支持 request({ url, method, data }) 配置形态
 */
import { ElMessage } from 'element-plus'
import { $fetch } from 'ofetch'

export interface RequestEnvelope<Data = any> {
  code: string
  message: string
  success: boolean
  data: Data
}

type RequestConfig = {
  url: string
  method?: string
  data?: object
  [key: string]: unknown
}

async function fetchEnvelope<Data = any>(
  urlOrConfig: string | RequestConfig,
  method = 'post',
  data?: object,
): Promise<RequestEnvelope<Data>> {
  const config: RequestConfig =
    typeof urlOrConfig === 'string' ? { url: urlOrConfig, method, data } : urlOrConfig

  const response = await $fetch<RequestEnvelope<Data>>(config.url, {
    baseURL: '/api',
    method: (config.method ?? 'post') as 'post',
    body: config.data,
  }).catch((err: unknown) => {
    // 网络层失败（5xx/断网）才走这里；业务码错误由 server 以 200 + 包络返回
    ElMessage.error('网络请求异常')
    return Promise.reject(err)
  })

  // 运行时可脏：历史后端曾混发 number 形态 code，防御性双判
  if (response.code !== '0' && (response.code as unknown) !== 0) {
    const errMsg = response?.message || '网络请求异常'
    ElMessage.error(errMsg)
  }
  return response
}

export const request = fetchEnvelope

/**
 * 旧 cachedRequest 语义已退化为 request 本体（缓存桩 clear 为 no-op），
 * mock 层数据量小，不重建缓存层；保留 .clear 调用点兼容
 */
export const cachedRequest = Object.assign(request, {
  clear: () => {
    // 缓存桩：旧调用点在新开会/结束前调用以失效缓存，mock 层无缓存可清
  },
})
