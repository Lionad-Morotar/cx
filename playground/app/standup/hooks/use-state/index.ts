import { ref } from 'vue'
import { useVModel } from '@vueuse/core'

import type { UseVModelOptions } from '@vueuse/core'
import type { Ref } from 'vue'

export function useState<P extends object, K extends keyof P, Name extends string>(
  props: P,
  key: K,
  emit?: (name: Name, ...args: any[]) => void,
  options?: UseVModelOptions<P[K], false>,
) {
  const dftOpts = {
    passive: true,
    deep: true,
    defaultValue: null,
  }
  const opts = Object.assign(dftOpts, options || {})

  type DftValue = (typeof opts)['defaultValue']

  const state =
    typeof props[key] !== 'undefined' ? useVModel(props, key, emit, opts) : ref(opts.defaultValue)

  return state as unknown as Ref<Exclude<P[K] | DftValue, undefined>>
}

export default useState
