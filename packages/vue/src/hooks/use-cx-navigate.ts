import { inject, provide } from 'vue'

import type { InjectionKey } from 'vue'

/**
 * 路由导航能力抽象：push/replace。
 * 宿主应用（如 playground 经 vue-router useRouter）经 provideCxNavigate 安装；
 * 物料（cx-navigate）经 useCxNavigate 消费，未注入时 noop + 警告，与
 * provideCxToast/provideCxMedia 同构。
 */
export type CxNavigateTarget = string | { path?: string; query?: Record<string, unknown> }

export interface CxNavigateProvider {
  push: (to: CxNavigateTarget) => void
  replace: (to: CxNavigateTarget) => void
}

export const CxNavigateKey: InjectionKey<CxNavigateProvider> = Symbol('cx-navigate')

/** 宿主侧：安装路由实现 */
export const provideCxNavigate = (provider: CxNavigateProvider) => provide(CxNavigateKey, provider)

const noopNavigate: CxNavigateProvider = {
  push: () => {
    console.warn('[cx] 未注入 navigate 服务（provideCxNavigate），跳转不可用')
  },
  replace: () => {
    console.warn('[cx] 未注入 navigate 服务（provideCxNavigate），跳转不可用')
  },
}

/** 消费侧：获取路由服务；未注入时返回降级实现 */
export const useCxNavigate = (): CxNavigateProvider => inject(CxNavigateKey, noopNavigate)
