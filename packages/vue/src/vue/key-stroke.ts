import { onKeyStroke } from '@vueuse/core'
import { watch } from 'vue'
import { useCleanups } from '@lionad/cx-definition'

import type { KeyFilter, OnKeyStrokeOptions } from '@vueuse/core'
import type { WatchSource } from 'vue'

/** 条件成立期间监听键盘事件（原为 p-ray vueuse/use-key-stroke） */
export const useKeyStrokeWhen = (
  getter: WatchSource | WatchSource[],
  key: KeyFilter,
  fn: (event: KeyboardEvent) => void,
  opts: OnKeyStrokeOptions = {
    target: window,
  },
) => {
  const clean = useCleanups()
  watch(
    getter,
    (nv) => {
      clean.cleanup()
      const shouldExec = Array.isArray(nv) ? nv.length && nv.every(Boolean) : Boolean(nv)
      if (shouldExec) {
        clean.add(onKeyStroke(key, fn, opts))
      }
    },
    { immediate: true },
  )
}
