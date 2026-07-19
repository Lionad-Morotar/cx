import { ref } from 'vue'
const pos = ref<{ top: number | null; left: number | null }>({ top: null, left: null })

/**
 * 共享上一次位置，
 * 在连续的多个弹窗间能有效复用
 */
export const useLastPosition = () => {
  return pos
}
