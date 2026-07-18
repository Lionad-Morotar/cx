import { watchEffect } from 'vue'
import { useIntervalFn, usePageLeave } from '@vueuse/core'
import type { AnyFn, UseIntervalFnOptions } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

const isLeave = usePageLeave()

export const useCxIntervalFn = (
  fn: AnyFn,
  interval?: MaybeRefOrGetter<number>,
  options?: UseIntervalFnOptions,
) => {
  const { pause, resume, isActive } = useIntervalFn(fn, interval || 350, options)

  watchEffect(() => {
    if (isLeave.value) {
      pause()
    } else {
      resume()
    }
  })

  return { pause, resume, isActive }
}
