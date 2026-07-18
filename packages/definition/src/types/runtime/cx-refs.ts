import type { ComputedRef, Ref } from 'vue'

import type { CxComponentRuntime } from './cx-component'

/**
 * 组件 ref 管理器的结构化类型。
 * 原代码从 hooks 导入名为 RefsManager 的类型，但该名字在任何包中都未定义
 * （p-ray use-refs.ts 实际导出 RefsMan），此处按 useRefs 返回结构补齐定义，
 * 由 cx-vue 的 useRefs 实现并对齐。
 */
export interface RefsManager<
  Data = {
    ref: any
    data: CxComponentRuntime
  },
> {
  maps: Record<string, Data>
  refs: ComputedRef<Data[]>
  set: (id: string, vm: Data) => void
  get: (id: string) => Data | undefined
  remove: (id: string) => void
  setRef: <G extends { id: string }>(item: G, ref: any, data?: Partial<Data>) => void
  removeRef: (item: { id: string }) => void
  getData: (x: { id: string } | string) => Data | undefined
  clear: () => void
  getAll: () => Data[]
  checkCmptsInited: (countNameInRef?: string) => Ref<boolean>
}

export type CxRefs<
  Data = {
    ref: any
    data: CxComponentRuntime
  },
> = RefsManager<Data>
