// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { ref, getCurrentInstance } from 'vue'

import type { Ref } from 'vue'

/**
 * Nuxt #imports 的离线 shim：vendored nuxt-ui-v2 脱离 Nuxt 运行时后，
 * 其组件所需的 Nuxt composables 在此给出等价/降级实现。
 */

let idSeed = 0
/** Nuxt useId 的等价物：进程内递增唯一 id（SSR 场景无跨端一致性需求） */
export const useId = () => `cx-v4-${++idSeed}`

// useState 的关键语义是跨组件实例按 key 共享，用模块级 Map 保真
const sharedStates = new Map<string, Ref<any>>()
export const useState = <T>(key: string, init?: () => T): Ref<T> => {
  if (!sharedStates.has(key)) {
    sharedStates.set(key, ref(init ? init() : undefined))
  }
  return sharedStates.get(key) as Ref<T>
}

/** 离线环境无 app 级覆盖配置，组件配置回退到 ui.config 默认值 */
export const useAppConfig = () => ({ ui: {} as Record<string, any> })

export const useNuxtApp = () => ({
  vueApp: getCurrentInstance()?.appContext?.app,
})

/** head 注入在离线 shim 中不可用（Notifications 等少数组件使用），降级为 no-op */
export const useHead = () => {}

export const defineNuxtPlugin = (fn: any) => fn
