import { tryOnScopeDispose, whenever } from '@vueuse/core'
import { onMounted, toValue, ref } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
/** radash sleep 的最小等价实现，避免引入整库 */
export const useSleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const macroTask = () => {
  return new Promise((resolve) => {
    const tick = setTimeout(resolve, 0)
    tryOnScopeDispose(() => {
      if (tick) clearTimeout(tick)
    })
  })
}
export const useMacroTask = async (fn: () => unknown) => {
  await macroTask()
  fn()
}
/** useUIReady 的简化版本 */
export const useReady = async (fn: () => unknown) => {
  await onMounted(() => useMacroTask(fn))
}

/**
 * make your callback exec in next macroTask,
 * useful when waiting for some DOM changes caused by data changing
 */
export const useNextMacroTask = async (
  getter: MaybeRefOrGetter<unknown>,
  fn: (x: boolean) => unknown,
) => {
  const stop = whenever(
    () => toValue(getter),
    async () => {
      await macroTask()
      if (toValue(getter)) {
        fn(true)
        stop()
      }
    },
  )
}

export const useUIReady = (
  getter?: MaybeRefOrGetter<unknown>,
  fn?: (x: boolean) => unknown,
) => {
  const isReady = ref(false)
  const _getter = getter || (() => isReady.value)

  useNextMacroTask(_getter, async () => {
    // in case of transition\animation ect.
    await useSleep(150)
    isReady.value = true
    fn?.(isReady.value)
  })

  return isReady
}
