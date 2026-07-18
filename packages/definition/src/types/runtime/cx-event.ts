import type { CxEventKey } from '../../configs'
import type { CxComponentRuntime } from './cx-component'
import type { RefsManager } from './cx-refs'

/** ******************************************************************* CxEvent */

/**
 * 组件的事件配置，会序列化为 component.data._cx_events 保存，
 * 渲染器会在组件的运行时解析事件并作事件拦截与转发，
 * 把设定好的 _cx_events 广播给对应的其它组件
 * @example
 * {
 *  id: 'event-id-123456',
 *  key: 'handle-click',
 *  subs: [
 *   { target: 'another-cmpt-id', trigger: 'refresh', args: [] },
 *   { target: 'another-cmpt-id-2', trigger: 'refresh', args: [] },
 *  ]
 * }
 */
export type CxEvent = {
  // 事件 ID
  id: string
  // 组件触发的事件名，
  // 即 Vue 中 emits('xxx') 的 'xxx'
  key: CxEventKey | string
  // 子事件
  subs: CxSubEvent[]
}

export type CxSubEvent = {
  // 触发的目标组件的 ID，
  target: string
  //  触发目标组件的暴露的事件
  trigger: CxEventKey | string
  // 参数
  args?: any[]
}

/**
 * 过期的 CxEvent 类型，
 * 只支持单广播单触发，
 * @deprecated
 */
export type CxEventDeprecated = {
  id: string
  key: string
  target: string
  trigger: string
  args?: any[]
}

export type CxEmitter = ((opts: {
  // 从哪个组件触发的事件
  cmpt: CxComponentRuntime
  // 事件名称（meta.emits 中记录的键名）
  eventKey: string
  // 事件参数
  args: any[]
}) => void) & {
  // 根据事件参数找到对应组件（的 Vue 组件实例），然后执行对应的方法
  trigger: (event: CxSubEvent) => Promise<void>
}
