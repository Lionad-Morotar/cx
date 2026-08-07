import { computed, inject, onScopeDispose } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { CxComponentRuntime, CxLoaderInstance } from '@lionad/cx-definition'

/**
 * useCxEventRouter — cx 事件总线(comp:cx-event:emit)的消费骨架
 *
 * 每个 cx 宿主卡片都要重复写的一段:订阅总线 → 按 id 前缀过滤本卡事件 →
 * 沿组件树反查物料 key(事件载荷只带节点 id,语义分流需要物料 key)→ 交 handler;
 * 订阅随组件 scope 自动 off(手写 onMounted/onBeforeUnmount 对,忘记 off 即泄漏)。
 * 事件源是物料交互,挂载前的事件天然不存在,故 setup 期即订阅,不漏挂载瞬间事件。
 *
 * 本骨架只管「事件到 handler」;direct/append/confirm/ignore 的语义分流归宿主
 * (comps-vtu 提供默认表,见 defineCxEventSemantics)。
 */

/** 总线原始事件载荷(render-component broadcast 形态;总线类型把 event 声明为 unknown,路由时收窄) */
export type CxEventPayload = {
  id: string
  event: unknown
  args: unknown[]
}

/** 路由后的事件载荷:附带沿组件树反查出的物料 key,event 已收窄为 string */
export type CxRoutedEvent = Omit<CxEventPayload, 'event'> & { event: string; key: string }

export function useCxEventRouter(
  components: ComputedRef<CxComponentRuntime[]> | Ref<CxComponentRuntime[]>,
  prefix: ComputedRef<string> | Ref<string>,
  handler: (event: CxRoutedEvent) => void,
  cx?: CxLoaderInstance,
): void {
  const bus = cx ?? inject<CxLoaderInstance>('cx')
  if (!bus) return

  // 事件载荷只带节点 id,物料×事件分流需沿组件树反查物料 key(含嵌套子节点)
  const keyByNodeId = computed(() => {
    const map = new Map<string, string>()
    const walk = (nodes: CxComponentRuntime[] | undefined) => {
      if (!nodes) return
      for (const n of nodes) {
        map.set(n.id, n.key)
        for (const arr of Object.values(n.components ?? {})) walk(arr)
      }
    }
    walk(components.value)
    return map
  })

  const listener = (p: CxEventPayload) => {
    if (typeof p?.id !== 'string' || typeof p.event !== 'string') return
    if (!p.id.startsWith(prefix.value)) return
    const key = keyByNodeId.value.get(p.id)
    if (!key) return
    handler({ ...p, event: p.event, key })
  }

  bus.hooks.on('comp:cx-event:emit', listener)
  onScopeDispose(() => bus.hooks.off('comp:cx-event:emit', listener))
}
