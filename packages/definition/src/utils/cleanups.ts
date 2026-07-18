import { tryOnScopeDispose } from '@vueuse/core'
import type { Fn } from '@vueuse/core'

type Cleanup = {
  add: (fn: Fn) => void
  cleanup: () => void
}

export function useCleanups(parent?: Cleanup) {
  const cleanups: Fn[] = []
  const cleanup = () => {
    try {
      cleanups.forEach((fn) => {
        try {
          fn?.()
        } catch {
          // mute
          // console.error(err)
        }
      })
    } finally {
      cleanups.length = 0
    }
  }
  const add = (fn: Fn) => cleanups.push(fn)

  if (parent) {
    parent.add(cleanup)
  }

  tryOnScopeDispose(cleanup)

  return {
    cleanups,
    add,
    cleanup,
  }
}
