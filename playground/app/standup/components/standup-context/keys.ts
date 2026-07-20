import type { InjectionKey, Ref } from 'vue'

import type { GroupOfStandup, Standup } from '../../apis'

/**
 * 站会 schema 渲染的上下文注入键。
 *
 * CxRender 不会把 SFC 的 slot scope 注入到 schema 子节点的 data，
 * 因此循环容器（group-list / card-list）在 v-for 的每一次迭代里
 * 用 StandupContextProvider provide 当前项，模板子节点经 inject 消费。
 */

/** 单个分组卡片实例的上下文（card-list 每次迭代注入） */
export interface StandupItemContext {
  standup: Standup
  group: GroupOfStandup
  idx: number
}

/** folder-container 暴露的折叠上下文（header slot 内的物料消费，用于触发折叠） */
export interface FolderContainerCtx {
  toggle: () => void
  fold: () => void
  unFold: () => void
  isFold: Ref<boolean>
}

export const StandupGroupKey: InjectionKey<GroupOfStandup> = Symbol('cx-standup-group')
export const StandupItemKey: InjectionKey<StandupItemContext> = Symbol('cx-standup-item')
export const FolderContainerCtxKey: InjectionKey<FolderContainerCtx> =
  Symbol('cx-folder-container-ctx')
