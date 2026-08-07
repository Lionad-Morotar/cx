import { describe, expect, it, vi } from 'vitest'
import { computed, createApp, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { CxLoader } from '@lionad/cx-definition'
import type { CxComponentRuntime } from '@lionad/cx-definition'

import { useCxEventRouter } from '../src/event/use-cx-event-router'
import type { CxRoutedEvent } from '../src/event/use-cx-event-router'

/**
 * useCxEventRouter — cx 事件总线消费骨架
 *
 * 订阅 comp:cx-event:emit,按 id 前缀过滤本卡事件,反查物料 key 后交 handler;
 * 订阅随组件 scope 自动 off(忘记 off 即泄漏)。挂载前的事件天然不存在
 * (事件源是物料交互),故 setup 期即订阅,不漏挂载瞬间事件。
 */

const TREE: CxComponentRuntime[] = [
  {
    id: 'ccx-test-0-0',
    key: 'cx-vtu-article',
    data: {},
    components: {
      default: [
        { id: 'ccx-test-0.default0-1', key: 'cx-vtu-option-list', data: {}, components: {} },
      ],
    },
  } as unknown as CxComponentRuntime,
]

const createLoader = () => new CxLoader().init(undefined, { app: createApp({}) })

const mountWithRouter = (
  handler: (e: CxRoutedEvent) => void,
  cx: CxLoader,
  provideCx = false,
) => {
  const Comp = defineComponent({
    setup() {
      if (provideCx) {
        // 默认 inject 路径:经 app 级 provide 取 cx(与生产 cx-nuxt 插件同形态)
        useCxEventRouter(computed(() => TREE), computed(() => 'ccx-test'), handler)
      } else {
        useCxEventRouter(computed(() => TREE), computed(() => 'ccx-test'), handler, cx)
      }
      return () => h('div')
    },
  })
  return mount(Comp, provideCx ? { global: { provide: { cx } } } : undefined)
}

describe('useCxEventRouter', () => {
  it('本前缀事件路由到 handler 并附带反查的物料 key(根节点)', () => {
    const cx = createLoader()
    const handler = vi.fn()
    mountWithRouter(handler, cx)

    cx.hooks.emit('comp:cx-event:emit', { id: 'ccx-test-0-0', event: 'action', args: [1] })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      id: 'ccx-test-0-0',
      event: 'action',
      args: [1],
      key: 'cx-vtu-article',
    })
  })

  it('嵌套子节点同样反查出物料 key', () => {
    const cx = createLoader()
    const handler = vi.fn()
    mountWithRouter(handler, cx)

    cx.hooks.emit('comp:cx-event:emit', {
      id: 'ccx-test-0.default0-1',
      event: 'change',
      args: [],
    })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'cx-vtu-option-list' }),
    )
  })

  it('非本前缀 id 的事件不调用 handler', () => {
    const cx = createLoader()
    const handler = vi.fn()
    mountWithRouter(handler, cx)

    cx.hooks.emit('comp:cx-event:emit', { id: 'ccx-other-0-0', event: 'action', args: [] })
    expect(handler).not.toHaveBeenCalled()
  })

  it('前缀匹配但不在组件树中的 id 不调用 handler', () => {
    const cx = createLoader()
    const handler = vi.fn()
    mountWithRouter(handler, cx)

    cx.hooks.emit('comp:cx-event:emit', { id: 'ccx-test-9-9', event: 'action', args: [] })
    expect(handler).not.toHaveBeenCalled()
  })

  it('组件卸载后订阅自动 off,事件不再调用 handler', () => {
    const cx = createLoader()
    const handler = vi.fn()
    const wrapper = mountWithRouter(handler, cx)
    wrapper.unmount()

    cx.hooks.emit('comp:cx-event:emit', { id: 'ccx-test-0-0', event: 'action', args: [] })
    expect(handler).not.toHaveBeenCalled()
  })

  it('默认 inject 路径:provide(cx) 后免传第四参', () => {
    const cx = createLoader()
    const handler = vi.fn()
    mountWithRouter(handler, cx, true)

    cx.hooks.emit('comp:cx-event:emit', { id: 'ccx-test-0-0', event: 'action', args: [] })
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
