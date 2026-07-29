import { useMemoize } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { useAsync } from '../use-task'

/**
 * 请求函数形态（宿主应用注入的 API 调用器）。
 * 原代码从 '@cx/apis/types' 导入，该路径在 p-ray 中不存在（幻影 import）。
 */
export type CxRequestFn = <Res = unknown>(opts: Record<string, unknown>) => Promise<Res>
/** 响应包装形态：getData 按 objects → data.data → data 的顺序回退取数 */
export type CxResponse<T = unknown> = {
  objects?: T
  data?: T & { data?: T }
  [key: string]: unknown
}

type UseRequestOpts = {
  method?: string
  url: string
  data?: unknown
  // 声明副作用函数，请求成功后执行，可以用于清理缓存等操作
  effect?: () => void
}

const requests: CxRequestFn[] = []
const provideInstance = (request: CxRequestFn) => {
  console.info('[info] request instance provide in useRequest', request)
  requests.push(request)
}
const removeInstance = (request: CxRequestFn) => {
  console.info('[info] request instance removed', request)
  const idx = requests.indexOf(request)
  if (idx >= 0) {
    requests.splice(idx, 1)
  }
}

/**
 * 生成两个请求函数，正常请求和缓存了结果的请求
 */
function _useRequest<Req = unknown, Res = unknown>(
  requestOpts: UseRequestOpts = { url: '' },
  dataOverride?: Partial<Req>,
) {
  const defaultOpts = cloneDeep(requestOpts)
  const effect = defaultOpts.effect
  delete defaultOpts.data
  delete defaultOpts.effect

  /** ---------------------------------------------------------------------- def */

  const apiNormal = async (data?: Req) => {
    try {
      const request = requests[requests.length - 1]!
      const res = await request<CxResponse<Res>>(
        Object.assign(
          {
            method: 'POST',
            data: Array.isArray(data)
              ? requestOpts.data || data || []
              : Object.assign({}, requestOpts.data, data || {}, dataOverride || {}),
          },
          defaultOpts,
        ),
      )
      if (res && effect) {
        await effect?.()
        console.log(`[info] effect of ${defaultOpts.url} executed.`)
      }
      return res
    } catch (err) {
      clearCached()
      throw err
    }
  }
  const apiCached = useMemoize(apiNormal) as unknown as typeof apiNormal & {
    clear: () => void
  }

  function clearCached() {
    apiCached.clear()
  }

  /** ---------------------------------------------------------------------- prop task */

  // 默认的取数据方法，从请求中取得实际的数据内容（不包含 code、success 等），
  // 应当从这里移除，放到使用方实现
  const getData = (fn: typeof apiNormal | typeof apiCached) => async (t: Req) => {
    const res = (await fn(t)) as CxResponse
    return (res?.objects || res?.data?.data || res?.data || res) as unknown as Res
  }

  apiNormal.task = useAsync(getData(apiNormal))
  apiCached.task = useAsync(getData(apiCached))

  /** ---------------------------------------------------------------------- method task */

  const reload = (fn: typeof apiNormal | typeof apiCached) => (t: Req) => fn.task.exec(t)

  apiNormal.reload = reload(apiNormal)
  apiCached.reload = reload(apiCached)

  /** ---------------------------------------------------------------------- return */

  return [apiNormal, apiCached] as const
}

const methods = {
  provideInstance,
  removeInstance,
}

export const useRequest = Object.assign(_useRequest, methods)

export type UseRequest = typeof _useRequest
