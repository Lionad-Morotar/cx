import { unref } from 'vue'
import { createCxID } from '../utils/create-id'

import type { CxComponentRuntime } from '../types/runtime/cx-component'
import type { CxEmitter, CxEvent, CxSubEvent } from '../types/runtime/cx-event'
import type { RefsManager } from '../types/runtime/cx-refs'

export const isValidEvent = (evt: CxEvent) => {
  return evt.id && evt.key && evt.subs
}
export const isValidSubEvent = (evt: CxSubEvent) => {
  return evt.target && evt.trigger
}

// 创建组件触发的事件。
// id 缺省走 createCxID() 随机；剧本生成等确定性场景（chunks 逐位比对禁随机）
// 经第二参数显式传入语义 id
export const createEvent = (key?: string, id?: string): CxEvent => {
  return {
    id: id || createCxID(),
    key: key || '',
    subs: [],
  }
}
export const createSubEvent = (): CxSubEvent => {
  return {
    target: '',
    trigger: '',
  }
}

/**
 * 创建事件广播器
 * 组件模版中给组件绑定了 meta.emits 定义的事件，
 * 即 <cx-tabs v-on="genEvtsFromCxMetaEmits" />，
 * 只要组件运行时抛出了对应事件就会被 CX 渲染器捕获，
 * 并通过对应 cxEmitter 实例事件广播器广播出去，
 */
export const createCxEmitter = (
  refs: RefsManager<{
    ref: unknown
    data: CxComponentRuntime
  }>,
): CxEmitter => {
  // 根据事件参数找到对应组件（的 Vue 组件实例），然后执行对应的方法
  const _trigger = async (event: CxSubEvent, compArgs: unknown[] = []) => {
    if (!isValidSubEvent(event)) {
      return console.log(`[info] invalid cx-event ${event}`)
    }
    const targets = (
      event.target === '*'
        ? Array.from(refs.getAll()).map((x) => x.ref)
        : [refs.get(event.target)?.ref]
    ).filter(Boolean)

    if (!targets.length) {
      console.log(`[info] event ${event.target} not found`)
      return
    }
    const bindArgs = event?.args || []

    targets.map((target) => {
      try {
        // target 是 Vue 组件实例，event.trigger 是动态暴露方法名（反射调用）
        ;(target as Record<string, ((...args: unknown[]) => void) | undefined> | undefined)?.[
          event.trigger as string
        ]?.(...bindArgs, ...compArgs)
      } catch (err) {
        console.error('[ERR] error when exec event', err)
      }
    })
  }
  // 外部可以调用的事件广播方法不需要传递组件的事件参数，
  // 所有参数可以通过 CxSubEvent.args 传递
  const trigger = async (event: CxSubEvent) => _trigger(event)

  // 根据 comp.data._cx_events 定义的事件数据，找到哪个组件订阅了当前事件，
  // 然后交由 trigger 方法执行事件
  const emitter: CxEmitter = ({ comp, eventKey, args }) => {
    const fromID = unref(comp).id

    /* 找到需要广播的事件 */

    const events = [] as CxEvent[]
    // refs.get()?.data 是 CxComponentRuntime；.data 取其 CxComponentData（含 _cx_events）
    const compRef = refs.get(fromID)?.data
    const compData = (compRef?.data || {}) as CxComponentRuntime['data']
    const evts: CxEvent[] = Array.isArray(compData?._cx_events) ? compData._cx_events : []
    const filtered = evts.filter((x) => x.key === eventKey)
    events.push(...filtered)

    /* 逐个事件执行 */

    events.forEach((mainEvent) => {
      mainEvent.subs.forEach((e) => _trigger(e, args))
    })
  }

  emitter.trigger = trigger

  return emitter
}
