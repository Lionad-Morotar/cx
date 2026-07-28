import { reactive, ref, watchEffect } from 'vue'
import { useIdle } from '@vueuse/core'

export function useIdleOnce(delay = 300, controlled = false) {
  const { idle } = useIdle(delay)
  const isIdled = ref(false)

  watchEffect(() => {
    if (idle.value) {
      isIdled.value = true
    }
  })

  const states = reactive({
    isIdled,
    reset: () => (isIdled.value = false),
  })
  watchEffect(() => {
    states.isIdled = isIdled.value
  })

  const ret = controlled ? states : isIdled

  // em... refactor with is?
  return ret as typeof controlled extends true ? typeof states : typeof isIdled
}
