import { computed, inject, provide, unref } from 'vue'

import type { ComputedRef, InjectionKey, MaybeRef } from 'vue'

/**
 * 媒体服务能力抽象：上传 + 预览 URL 解析。
 * 原为 p-ray useOSS 的 auto-import 耦合，抽离后改为显式注入扩展点，
 * 宿主应用（如 p-ray 的 OSS 实现）经 provideCxMedia 安装。
 */
export interface CxMediaProvider {
  upload: (file: File, opts?: Record<string, any>) => Promise<{ url: string } & Record<string, any>>
  getPreviewURL: (url: MaybeRef<string | undefined>) => ComputedRef<string>
}

export const CxMediaKey: InjectionKey<CxMediaProvider> = Symbol('cx-media')

/** 宿主侧：安装媒体服务实现 */
export const provideCxMedia = (provider: CxMediaProvider) => provide(CxMediaKey, provider)

const noopMedia: CxMediaProvider = {
  upload: () => {
    console.warn('[cx] 未注入媒体服务（provideCxMedia），上传不可用')
    return Promise.reject(new Error('cx-media not provided'))
  },
  // 未注入时预览退化为原始 URL（保持渲染链路可用）
  getPreviewURL: (url) => computed(() => unref(url) || ''),
}

/** 消费侧：获取媒体服务；未注入时返回降级实现 */
export const useCxMedia = (): CxMediaProvider => inject(CxMediaKey, noopMedia)
