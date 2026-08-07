import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { CxLoader, define } from '@lionad/cx-definition'

import { toRenderableComponents } from '../src/utils/to-renderable'
import type { CxSpec } from '@lionad/cx-stream'

/**
 * toRenderableComponents — 「部分树 → 可渲染树」管线
 *
 * 先经 pruneIncompleteNode 修剪「id 闭合、key 未传」的补全后代(closingBrackets
 * 合法补全产物,但渲染按 key 匹配物料,key 缺失即不可渲染),再经 hydrateCxSpec
 * 赋确定性 id 并透传 cx 推导 _cx_events——增量区与闭合卡同一事件接线来源。
 */

describe('toRenderableComponents — prune 形态', () => {
  it('null 输入返回 null', () => {
    expect(toRenderableComponents(null, 'p')).toBeNull()
  })

  it('单根 prune 为空(根无 key)返回 null', () => {
    expect(toRenderableComponents({ id: 'x' } as unknown as CxSpec, 'p')).toBeNull()
  })

  it('数组根逐节点 prune 后全空返回 null', () => {
    const spec = [{ id: 'a' }, { id: 'b' }] as unknown as CxSpec
    expect(toRenderableComponents(spec, 'p')).toBeNull()
  })

  it('数组根部分 prune:有效节点保留,无 key 节点剔除', () => {
    const spec = [
      { key: 'cx-vtu-article', data: { title: 'T' } },
      { id: 'x-1' },
    ] as unknown as CxSpec
    const components = toRenderableComponents(spec, 'p')
    expect(components).toHaveLength(1)
    expect(components?.[0]?.key).toBe('cx-vtu-article')
  })

  it('key 未传完的补全后代被修剪,已完整节点保留', () => {
    const spec = {
      key: 'cx-vtu-plan',
      data: {},
      components: [{ key: 'cx-vtu-article', data: {} }, { id: 'x-1' }],
    } as unknown as CxSpec
    const components = toRenderableComponents(spec, 'p')
    expect(components).toHaveLength(1)
    const children = components?.[0]?.components?.default ?? []
    expect(children).toHaveLength(1)
    expect(children[0]?.key).toBe('cx-vtu-article')
  })
})

describe('toRenderableComponents — hydrate 接线', () => {
  it('确定性 id:同 spec 同 prefix 两次水合 id 序列一致', () => {
    const spec: CxSpec = {
      key: 'cx-vtu-plan',
      data: {},
      components: [{ key: 'cx-vtu-article', data: {} }],
    }
    const a = toRenderableComponents(spec, 'ccx-msg-1-p0')
    const b = toRenderableComponents(spec, 'ccx-msg-1-p0')
    const idsOf = (list: ReturnType<typeof toRenderableComponents>) =>
      (list ?? []).flatMap((n) => [
        n.id,
        ...(Object.values(n.components ?? {}) as { id: string }[][]).flatMap((arr) =>
          arr.map((c) => c.id),
        ),
      ])
    expect(idsOf(a)).toEqual(idsOf(b))
  })

  it('cx 透传:管线末端 hydrate 经 cx.getEmits 注入 _cx_events', async () => {
    const app = createApp({})
    const cx = new CxLoader().init(undefined, { app })
    await cx.installComponent(
      'cx-test-widget',
      define({
        name: '测试物料',
        description: '测试',
        key: 'cx-test-widget',
        icon: 'i-test',
        component: { name: 'CxTestWidget', render: () => null },
        emits: { action: { name: '操作' } },
      }),
    )
    const components = toRenderableComponents({ key: 'cx-test-widget' }, 'p', cx)
    expect(components?.[0]?.data?._cx_events).toEqual([
      { id: 'p-0-0-ev0', key: 'action', subs: [] },
    ])
  })
})
