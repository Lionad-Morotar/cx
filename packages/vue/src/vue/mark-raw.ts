import { markRaw } from 'vue'

/** 条件化 markRaw：空值直通（原为 p-ray composables/vue 的同名工具） */
export const useMarkRaw = (x: any) => {
  return x ? markRaw(x) : x
}
