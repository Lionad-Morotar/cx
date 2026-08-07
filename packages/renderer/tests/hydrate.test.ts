import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { CxLoader, define } from '@lionad/cx-definition'

import { hydrateCxSpec } from '../src/utils/hydrate'

/**
 * hydrateCxSpec:LLM 最小 spec({ key, data?, components? })→ cx-render 运行时树。
 * - 递归赋稳定 id(`${prefix}-${path}-${seq}`),node.id 已存在时保留,解决流式 id 漂移
 * - 交互物料经 cx.utils.getEmits 推导 _cx_events(三必填 id/key/subs),
 *   使 getEmits ∩ _cx_events 非空、render-component 据此接线 v-on
 * - 无 loader 场景(编辑器等)退回显式事件表;非交互物料(getEmits 空)不注入
 */

const createTestLoader = async () => {
  // 无 url 场景:init 只装配 config/installed,不触发 metadata 网络加载(load 才 fetch)
  const cx = new CxLoader().init(undefined, { app: createApp({}) })
  await cx.installComponent(
    'cx-test-option-list',
    define({
      name: '测试选项',
      description: '测试用交互物料',
      key: 'cx-test-option-list',
      icon: 'i-test',
      component: { name: 'CxTestOptionList', render: () => null },
      emits: {
        action: { name: '操作触发' },
        change: { name: '选择变更' },
        'update:modelValue': { name: 'v-model 同步' },
      },
    }),
  )
  return cx
}

describe('hydrateCxSpec — id 水合', () => {
  it('数组根逐节点赋稳定 id,seq 跨根连续,二次调用同序列', () => {
    const spec = [{ key: 'a' }, { key: 'b' }]
    const first = hydrateCxSpec(spec, 'p')
    const second = hydrateCxSpec(spec, 'p')
    expect(first.map((n) => n.id)).toEqual(['p-0-0', 'p-1-1'])
    expect(second.map((n) => n.id)).toEqual(['p-0-0', 'p-1-1'])
  })

  it('单根对象等效单元素数组', () => {
    const [root] = hydrateCxSpec({ key: 'a' }, 'p')
    expect(root.id).toBe('p-0-0')
  })

  it('node.id 已存在时保留', () => {
    const [root] = hydrateCxSpec({ id: 'fixed', key: 'a' }, 'p')
    expect(root.id).toBe('fixed')
  })

  it('嵌套 components 数组形态归入 default 组并递归赋 id', () => {
    const [root] = hydrateCxSpec(
      { key: 'a', components: [{ key: 'b' }, { key: 'c' }] },
      'p',
    )
    const kids = root.components?.default ?? []
    expect(kids.map((n) => n.id)).toEqual(['p-0.default0-1', 'p-0.default1-2'])
  })

  it('嵌套 components 分组形态按插槽递归', () => {
    const [root] = hydrateCxSpec(
      { key: 'a', components: { header: [{ key: 'b' }], footer: [{ key: 'c' }] } as never,
      },
      'p',
    )
    expect(root.components?.header?.[0]?.id).toBe('p-0.header0-1')
    expect(root.components?.footer?.[0]?.id).toBe('p-0.footer0-2')
  })
})

describe('hydrateCxSpec — _cx_events 注入', () => {
  it('cx 实例路径:键集等于已安装物料 meta emits 全集(含 v-model 同步键)', async () => {
    const cx = await createTestLoader()
    const [root] = hydrateCxSpec({ key: 'cx-test-option-list' }, 'p', { cx })
    const events = root.data?._cx_events as { id: string; key: string; subs: unknown[] }[]
    expect(events.map((e) => e.key)).toEqual(['action', 'change', 'update:modelValue'])
    // 三必填:缺 subs 会在 cx-emitter 广播链抛 TypeError
    expect(events[0]).toEqual({ id: 'p-0-0-ev0', key: 'action', subs: [] })
  })

  it('嵌套子节点同样经 cx 推导注入', async () => {
    const cx = await createTestLoader()
    const [root] = hydrateCxSpec(
      { key: 'cx-test-card', components: [{ key: 'cx-test-option-list' }] },
      'p',
      { cx },
    )
    const kid = root.components?.default?.[0]
    expect(kid?.data?._cx_events).toBeDefined()
  })

  it('未注册物料 getEmits 为空,不注入 _cx_events', async () => {
    const cx = await createTestLoader()
    const [root] = hydrateCxSpec({ key: 'cx-test-static' }, 'p', { cx })
    expect(root.data?._cx_events).toBeUndefined()
  })

  it('显式事件表路径:无 cx 时按表注入', () => {
    const [root] = hydrateCxSpec({ key: 'cx-test-option-list' }, 'p', {
      events: { 'cx-test-option-list': ['action', 'change'] },
    })
    const events = root.data?._cx_events as { key: string }[]
    expect(events.map((e) => e.key)).toEqual(['action', 'change'])
  })

  it('无任何事件源时不注入', () => {
    const [root] = hydrateCxSpec({ key: 'cx-test-option-list' }, 'p')
    expect(root.data?._cx_events).toBeUndefined()
  })
})
