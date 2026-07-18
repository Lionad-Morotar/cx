import { inject, provide } from 'vue'

import type { InjectionKey } from 'vue'

/**
 * 上传函数形态：宿主应用（如 p-ray 的 OSS 上传）注入的实现。
 * 原为 p-ray useOSS 的 auto-import 耦合，抽离后改为显式注入扩展点。
 */
export type CxUploadFn = (
  file: File,
  opts?: Record<string, any>,
) => Promise<{ url: string } & Record<string, any>>

export const CxUploadKey: InjectionKey<CxUploadFn> = Symbol('cx-upload')

/** 宿主侧：安装上传实现 */
export const provideCxUpload = (fn: CxUploadFn) => provide(CxUploadKey, fn)

const noopUpload: CxUploadFn = () => {
  console.warn('[cx] 未注入上传实现（provideCxUpload），上传不可用')
  return Promise.reject(new Error('cx-upload not provided'))
}

/** 消费侧：获取上传实现；未注入时返回仅警告的 no-op（保持渲染链路不炸） */
export const useCxUpload = (): CxUploadFn => inject(CxUploadKey, noopUpload)
