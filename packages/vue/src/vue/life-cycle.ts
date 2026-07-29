import { onMounted, onUnmounted, watch } from 'vue'
import { watchOnce } from '@vueuse/core'

import type { Ref, WatchCallback, WatchOptions, WatchSource } from 'vue'

/**
 * mounted 后才开始监听的 watch 族（原为 p-ray composables/vue/life-cycle.ts，
 * 按 cx 使用面裁剪：useMountedCall/useMountedReq 未被 cx 使用，未内化）。
 */
type ToValue<T> = T extends (...args: unknown[]) => infer R
  ? T extends Ref<infer V>
    ? V
    : R
  : T extends Ref<infer V>
    ? V
    : T

export const useMountedWatch = <
  T extends WatchSource,
  C extends WatchCallback<ToValue<T>>,
  O extends WatchOptions,
>(
  source: T,
  callback: C,
  opts?: O,
) => {
  onMounted(() => {
    const stop = watch(source, callback, opts)
    onUnmounted(() => stop())
  })
}

export const useMountedWatchImmediate = <
  T extends WatchSource,
  C extends WatchCallback<ToValue<T>>,
  O extends WatchOptions,
>(
  source: T,
  callback: C,
  opts?: O,
) => {
  useMountedWatch(source, callback, { ...opts, immediate: true })
}

export const useMountedOnce = <
  T extends WatchSource,
  C extends WatchCallback<ToValue<T>>,
  O extends WatchOptions,
>(
  source: T,
  callback: C,
  opts?: O,
) => {
  onMounted(() => {
    // watchOnce 的泛型约束比原版 watch 更严格，此处按原宽松语义放行
    watchOnce(
      source as unknown as Parameters<typeof watchOnce>[0],
      callback as unknown as Parameters<typeof watchOnce>[1],
      opts as unknown as Parameters<typeof watchOnce>[2],
    )
  })
}

export const useMountedOnceImmediate = <
  T extends WatchSource,
  C extends WatchCallback<ToValue<T>>,
  O extends WatchOptions,
>(
  source: T,
  callback: C,
  opts?: O,
) => {
  useMountedOnce(source, callback, { ...opts, immediate: true })
}
