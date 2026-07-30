import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'

import { buildSampleNode, type CxMeta } from '../app/dev/material-utils'
import type { VariantRegistry } from '../app/dev/variants-utils'
import { createArrayTrigger, createTriggerRegistry, type CxSpec } from '@lionad/cx-stream'

// DevShowcase 契约：sidebar 分组渲染 / 选中切换 / URL 回退 / 关键词过滤 / 多 variant 并列 / headless 占位。
// CxRender 经 vi.mock 渲染为节点 id 文本（显式 import 使模块级拦截生效，见 flow-mem nuxt/components）；
// useRoute/useRouter 为 Nuxt 自动导入全局，测试经 globalThis 覆盖（与 setup.ts 的 h3 挂载同式）。

vi.mock('@lionad/cx-render', () => ({
  CxRender: defineComponent({
    name: 'CxRender',
    props: { components: { type: Array, required: true } },
    setup(props) {
      return () =>
        h(
          'div',
          { class: 'cx-render-stub' },
          (props.components as { id: string }[]).map((c) => c.id).join(','),
        )
    },
  }),
}))

import DevShowcase from '../app/components/DevShowcase.vue'

const makeMeta = (key: string, name: string, headless = false): CxMeta => ({
  key,
  name,
  headless: headless || undefined,
  props: { label: { name: '文本', type: 'short', initial: `${name}示例` } },
})

const makeItem = (meta: CxMeta) => ({ meta, node: buildSampleNode(meta) })

// α 组：alpha（3 variant 手写）/ beta；β 组：gamma / delta-headless
const metaAlpha = makeMeta('cx-fake-alpha', '阿尔法')
const metaBeta = makeMeta('cx-fake-beta', '贝塔')
const metaGamma = makeMeta('cx-fake-gamma', '伽马')
const metaDelta = makeMeta('cx-fake-delta', '德尔塔', true)

const groups = [
  { name: 'α 组', items: [makeItem(metaAlpha), makeItem(metaBeta)] },
  { name: 'β 组', items: [makeItem(metaGamma), makeItem(metaDelta)] },
]

const registry: VariantRegistry = {
  'cx-fake-alpha': [
    { label: '默认形态' },
    { label: '强调形态', data: { label: '强调' } },
    { label: '低调形态', data: { label: '低调' } },
  ],
}

const routeState = reactive<{ query: Record<string, string> }>({ query: {} })
const pushed: { query: Record<string, string> }[] = []

beforeEach(() => {
  routeState.query = {}
  pushed.length = 0
  ;(globalThis as Record<string, unknown>).useRoute = () => routeState
  ;(globalThis as Record<string, unknown>).useRouter = () => ({
    push: (to: { query: Record<string, string> }) => {
      pushed.push(to)
      routeState.query = { ...to.query }
      return Promise.resolve()
    },
  })
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).useRoute
  delete (globalThis as Record<string, unknown>).useRouter
})

const mountShowcase = () => mount(DevShowcase, { props: { groups, variants: registry } })

describe('DevShowcase sidebar 渲染', () => {
  it('两组四 item 全渲染，testid 齐备', () => {
    const wrapper = mountShowcase()
    expect(wrapper.find('[data-testid="dev-showcase"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid^="sidebar-group-"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-testid^="sidebar-item-"]')).toHaveLength(4)
    expect(wrapper.find('[data-testid="sidebar-item-cx-fake-alpha"]').text()).toContain('阿尔法')
  })

  it('默认选中首组首 item，主区渲染其 3 个 variant 块（并列，id 序号连续）', () => {
    const wrapper = mountShowcase()
    const selected = wrapper.find('[aria-current="true"]')
    expect(selected.attributes('data-testid')).toBe('sidebar-item-cx-fake-alpha')
    const blocks = wrapper.findAll('[data-testid^="variant-cx-fake-alpha-"]')
    expect(blocks.map((b) => b.attributes('data-testid'))).toEqual([
      'variant-cx-fake-alpha-0',
      'variant-cx-fake-alpha-1',
      'variant-cx-fake-alpha-2',
    ])
    expect(wrapper.text()).toContain('强调形态')
    // CxRender stub 输出节点 id，证实三个 variant 节点并列渲染
    expect(wrapper.findAll('.cx-render-stub').map((s) => s.text())).toEqual([
      'dev-cx-fake-alpha-v0',
      'dev-cx-fake-alpha-v1',
      'dev-cx-fake-alpha-v2',
    ])
  })

  it('未手写 variant 的物料回落单个默认块', async () => {
    routeState.query = { c: 'cx-fake-beta' }
    const wrapper = mountShowcase()
    expect(wrapper.findAll('[data-testid^="variant-"]')).toHaveLength(1)
    expect(wrapper.find('[data-testid="variant-cx-fake-beta-0"]').text()).toContain('默认')
  })

  it('headless 物料渲染占位文案，不渲染 CxRender', () => {
    routeState.query = { c: 'cx-fake-delta' }
    const wrapper = mountShowcase()
    expect(wrapper.text()).toContain('无可见 UI')
    expect(wrapper.findAll('.cx-render-stub')).toHaveLength(0)
  })
})

describe('DevShowcase 选中与 URL', () => {
  it('点击 item 经 router.push 写 ?c=，主区切换且旧块零残留', async () => {
    const wrapper = mountShowcase()
    await wrapper.find('[data-testid="sidebar-item-cx-fake-gamma"]').trigger('click')
    expect(pushed).toHaveLength(1)
    expect(pushed[0]!.query.c).toBe('cx-fake-gamma')
    await flushPromises()
    expect(wrapper.find('[aria-current="true"]').attributes('data-testid')).toBe(
      'sidebar-item-cx-fake-gamma',
    )
    expect(wrapper.find('[data-testid="variant-cx-fake-gamma-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid^="variant-cx-fake-alpha-"]').exists()).toBe(false)
  })

  it('URL 带未知 key 时回退首 item 且不抛错', () => {
    routeState.query = { c: 'cx-nonexistent' }
    const wrapper = mountShowcase()
    expect(wrapper.find('[aria-current="true"]').attributes('data-testid')).toBe(
      'sidebar-item-cx-fake-alpha',
    )
  })
})

describe('DevShowcase 过滤', () => {
  it('关键词过滤 item 与空组，清空后恢复', async () => {
    const wrapper = mountShowcase()
    const input = wrapper.find('[data-testid="sidebar-filter"]')
    await input.setValue('伽马')
    expect(wrapper.findAll('[data-testid^="sidebar-item-"]')).toHaveLength(1)
    // α 组整组隐藏（无匹配 item）
    expect(wrapper.findAll('[data-testid^="sidebar-group-"]')).toHaveLength(1)
    await input.setValue('')
    expect(wrapper.findAll('[data-testid^="sidebar-item-"]')).toHaveLength(4)
    expect(wrapper.findAll('[data-testid^="sidebar-group-"]')).toHaveLength(2)
  })

  it('选中项被过滤隐藏时主区保持不变', async () => {
    const wrapper = mountShowcase()
    // 先切到 gamma 再过滤掉它
    await wrapper.find('[data-testid="sidebar-item-cx-fake-gamma"]').trigger('click')
    await flushPromises()
    await wrapper.find('[data-testid="sidebar-filter"]').setValue('阿尔法')
    expect(wrapper.find('[data-testid="sidebar-item-cx-fake-gamma"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="variant-cx-fake-gamma-0"]').exists()).toBe(true)
  })

  it('过滤大小写不敏感（key 子串匹配）', async () => {
    const wrapper = mountShowcase()
    await wrapper.find('[data-testid="sidebar-filter"]').setValue('ALPHA')
    expect(wrapper.findAll('[data-testid^="sidebar-item-"]')).toHaveLength(1)
    expect(wrapper.find('[data-testid="sidebar-item-cx-fake-alpha"]').exists()).toBe(true)
  })
})

// 回放并入契约：传 replay 时，含增量 trigger 的物料 variant 块渲染回放按钮，无 trigger 者不渲染；
// 点击经 useCardReplay 切到 playing（图标 ▶→■）。引擎零改写复用（import 来源不变）。
const listMeta: CxMeta = {
  key: 'cx-fake-list',
  name: '假列表',
  props: { rows: { name: '行', type: 'json', initial: [1, 2, 3] } },
}
const replayGroups = [
  { name: '回放组', items: [makeItem(listMeta), makeItem(metaBeta)] },
]
const triggerRegistry = createTriggerRegistry<CxSpec>()
triggerRegistry.register('cx-fake-list', createArrayTrigger({ key: 'cx-fake-list', arrayKey: 'rows' }))
const replayProp = {
  registry: triggerRegistry,
  countOf: (node: { data?: Record<string, unknown> }) => {
    const r = node.data?.rows
    return Array.isArray(r) ? r.length : null
  },
}

describe('DevShowcase 回放并入', () => {
  it('有 trigger 的物料渲染回放按钮，无 trigger 者不渲染', () => {
    const wrapper = mount(DevShowcase, {
      props: { groups: replayGroups, variants: {}, replay: replayProp },
    })
    // 默认选中 list（首 item）
    expect(wrapper.find('[data-testid="replay-cx-fake-list-0"]').exists()).toBe(true)
    // 切到 beta（无 trigger）应无回放按钮
    routeState.query = { c: 'cx-fake-beta' }
    const w2 = mount(DevShowcase, {
      props: { groups: replayGroups, variants: {}, replay: replayProp },
    })
    expect(w2.find('[data-testid^="replay-"]').exists()).toBe(false)
  })

  it('点击回放按钮切到 playing（图标 ▶→■）', async () => {
    const wrapper = mount(DevShowcase, {
      props: { groups: replayGroups, variants: {}, replay: replayProp },
    })
    const btn = wrapper.find('[data-testid="replay-cx-fake-list-0"]')
    expect(btn.text()).toBe('▶')
    await btn.trigger('click')
    expect(wrapper.find('[data-testid="replay-cx-fake-list-0"]').text()).toBe('■')
  })

  it('未传 replay 时即使物料有 trigger 也不渲染回放按钮（向后兼容）', () => {
    const wrapper = mount(DevShowcase, { props: { groups: replayGroups, variants: {} } })
    expect(wrapper.find('[data-testid^="replay-"]').exists()).toBe(false)
  })

  it('sidebar 对含 trigger 的物料显示 stream 标签，无 trigger / 未传 replay 者不显示', () => {
    // 传 replay：list 有 trigger 显示标签，beta 无 trigger 不显示
    const w1 = mount(DevShowcase, {
      props: { groups: replayGroups, variants: {}, replay: replayProp },
    })
    expect(w1.find('[data-testid="stream-tag-cx-fake-list"]').exists()).toBe(true)
    expect(w1.find('[data-testid="stream-tag-cx-fake-beta"]').exists()).toBe(false)
    // 未传 replay：即便物料有 trigger 也不显示标签
    const w2 = mount(DevShowcase, { props: { groups: replayGroups, variants: {} } })
    expect(w2.find('[data-testid^="stream-tag-"]').exists()).toBe(false)
  })

  it('sidebar-item 为名称 + 流式标记两子节点结构（flex 共置；ellipsis 由 scoped css 提供，浏览器验证）', () => {
    const w1 = mount(DevShowcase, {
      props: { groups: replayGroups, variants: {}, replay: replayProp },
    })
    const tag = w1.find('[data-testid="stream-tag-cx-fake-list"]')
    const name = tag.element.previousElementSibling as HTMLElement
    expect(name.classList.contains('item-name')).toBe(true)
    expect(name.textContent).toBe('假列表')
    // 名称与标记同为 button 直接子节点，配合 .sidebar-item flex + gap 共置
    expect(name.parentElement!.classList.contains('sidebar-item')).toBe(true)
    expect(tag.element.parentElement).toBe(name.parentElement)
  })

  // 注：onBeforeUnmount 清理缓存 timer 的收口无法在此无头断言——replayCache 为实例私有，
  // 且 useCardReplay 的 phase 闭包不对外暴露；该修复的正确性由外部正交审查的根因分析背书
  // （render 期 getCurrentInstance() 为 null 致内部 onUnmounted 失效，持有者 setup 期统一清理）。
})
