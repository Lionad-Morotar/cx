import { computed, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * 增量视图的最后帧缓存：流播完（success）后 pendingSource 清空、extractor 出 null，
 * 若增量视图随之清空，「生长到最后的形态」会瞬间被提示文案替换——
 * 增量管线与终态渲染是同一棵树的两种时态，而非接力交接。
 * 缓存最后非空帧让增量视图停留在最后一帧；清空时机由调用方（reset/剧本切换）控制。
 */
export function useLastFrame<T>(source: Ref<T | null>) {
  const lastFrame = shallowRef<T | null>(null) as Ref<T | null>
  // immediate：初始即非空的源也应入缓存，否则首帧即成功态的源流会丢失最后帧
  watch(
    source,
    (value) => {
      if (value !== null) lastFrame.value = value
    },
    { immediate: true },
  )
  const frame = computed(() => source.value ?? lastFrame.value)
  function clear() {
    lastFrame.value = null
  }
  return { frame, clear }
}
