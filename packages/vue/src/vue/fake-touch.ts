import { has } from '@lionad/cx-definition'
import { unref } from 'vue'

/** 解引用后的真值判断（原为 p-ray utils 的同名工具） */
export const fakeTouch = (x: unknown) => has(unref(x))
