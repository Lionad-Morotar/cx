/**
 * DOM 工具（内化自 p-ray composables/dom/index.ts 的 cx 使用面）。
 */
import { ref, unref, watch } from 'vue'
import { extendRef, tryOnScopeDispose, useMemoize } from '@vueuse/core'
import { omit } from 'lodash-es'

import type { MaybeRef } from 'vue'

export const getRect = (x: HTMLElement | null) => {
  return x ? x.getBoundingClientRect() : null
}

export const getStyle = (x: HTMLElement | null) => {
  return x ? window.getComputedStyle(x) : null
}

type UseQueryOpts = {
  fromElm?: MaybeRef<HTMLElement>
  // cache key, if not provided, will auto generate by selector and opts
  id?: string
  retry?: number
  getRetryTimeout?: (retry: number, initialTimeout?: number) => number
  autoStop?: boolean
}

/** 带重试轮询的 querySelector（原为 p-ray composables/dom 的 useQuery） */
export const useQuery = (selector: string, opts: UseQueryOpts = {}) => {
  const elm = ref<HTMLElement | null>(null)

  const {
    fromElm = document,
    autoStop = true,
    retry = 10,
    getRetryTimeout = (retry: number) => 100 * (retry ** 2),
  } = opts || {}

  const count = ref(0)
  let tick: ReturnType<typeof setInterval> | undefined
  const stop = () => {
    tick && clearInterval(tick)
  }
  const start = () => {
    tick = setInterval(() => {
      count.value++
      if (count.value > retry) {
        clearInterval(tick)
      }
      if (!unref(fromElm)) {
        elm.value = null
        return
      }
      const res = unref(fromElm).querySelector(selector)
      if (res) {
        if (autoStop) stop()
        elm.value = res as HTMLElement
      } else {
        elm.value = null
      }
    }, getRetryTimeout(count.value, 100))
  }

  watch(() => unref(fromElm), start, { immediate: true })

  tryOnScopeDispose(() => {
    stop()
    elm.value = null
  })

  const state = extendRef(elm, {
    retry,
    count,
    stop,
    start,
  })
  return state
}

/** useQuery 的 useMemoize 缓存版（getKey 忽略 fromElm 本体，取其 id 标记） */
export const useQueryCached = useMemoize(useQuery, {
  getKey: (selector: string, opts?: UseQueryOpts) => {
    const jsonOpts = omit(opts, ['fromElm'])
    const fromElm = opts?.fromElm
      ? unref(opts.fromElm)?.getAttribute?.('id') || 'unknown'
      : 'document'
    return opts?.id || selector + '-' + JSON.stringify(jsonOpts) + '-' + fromElm
  },
})
