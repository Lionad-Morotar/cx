import { ref } from 'vue'
import { isFunction, isNil } from 'lodash-es'
import { useLocalStorage, useSessionStorage, useVModel } from '@vueuse/core'

import type { AnyFn, UseVModelOptions } from '@vueuse/core'
import type { Ref } from 'vue'

export function useCxState<P extends Record<string, any>, K extends keyof P>(
  props: P,
  key: K,
  emits?: AnyFn,
  options?: UseVModelOptions<P[K], false> & {
    useVModel?: boolean
    ref?: Ref<any>
    storage?: 'local-storage' | 'default' | 'session-storage'
    storageKey?: string
  },
) {
  const dftOpts = {
    useVModel: true,
    passive: true,
    deep: true,
    defaultValue: null,
    storage: 'default',
    storageKey: key,
  }
  const opts = Object.assign(dftOpts, options || {})

  const getDefaultValue = () => {
    return isFunction(opts.defaultValue) ? (opts.defaultValue as () => P[K])() : opts.defaultValue
  }

  type DftValue = (typeof opts)['defaultValue']

  const state =
    opts.useVModel || !isNil(props[key])
      ? useVModel(props, key, emits, opts)
      : opts.storage === 'local-storage'
        ? useLocalStorage(String(opts.storageKey || key), getDefaultValue())
        : opts.storage === 'session-storage'
          ? useSessionStorage(String(opts.storageKey || key), getDefaultValue())
          : opts.storage === 'default'
            ? ref(getDefaultValue())
            : ref(getDefaultValue())

  return state as unknown as Ref<Exclude<P[K] | DftValue, undefined>>
}

export function useCxStates() {
  throw new Error('wip warning')
}
