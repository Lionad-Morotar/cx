import { createSharedComposable, useMouse, useWindowScroll } from '@vueuse/core'

/** 全局共享鼠标位置（原为 p-ray vueuse/use-position） */
export const useSharedMouse = createSharedComposable(useMouse)


/** 全局共享窗口滚动位置（原为 p-ray vueuse/use-position） */
export const useSharedWindowScroll = createSharedComposable(useWindowScroll)
