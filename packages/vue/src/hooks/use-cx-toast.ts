import { inject, provide } from 'vue'

import type { InjectionKey } from 'vue'

/**
 * Toast 服务能力抽象：弹出反馈提示。
 * 宿主应用（如 playground 经 nuxt-ui useToast）经 provideCxToast 安装；
 * 物料（cx-toast）经 useCxToast 消费，未注入时退化为 noop + 警告，
 * 保持渲染链路可用（与 provideCxMedia 同构）。
 */
export interface CxToastOptions {
  title: string
  description?: string
  color?: 'success' | 'error' | 'info' | 'warning'
}

export interface CxToastProvider {
  show: (opts: CxToastOptions) => void
}

export const CxToastKey: InjectionKey<CxToastProvider> = Symbol('cx-toast')

/** 宿主侧：安装 toast 服务实现 */
export const provideCxToast = (provider: CxToastProvider) => provide(CxToastKey, provider)

const noopToast: CxToastProvider = {
  show: () => {
    console.warn('[cx] 未注入 toast 服务（provideCxToast），反馈不可用')
  },
}

/** 消费侧：获取 toast 服务；未注入时返回降级实现 */
export const useCxToast = (): CxToastProvider => inject(CxToastKey, noopToast)
