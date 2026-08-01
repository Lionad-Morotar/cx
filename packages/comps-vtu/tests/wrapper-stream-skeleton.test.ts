import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxVtu } from '../src/index'

/**
 * 长主体包装层骨架：借槽不可行（空主体时物料内部无占位 DOM，正文区被
 * v-if 成注释节点），统一自绘——StreamSkeleton 替换物料，判据分两支：
 * 标记分支（code/body/post 必填字段的 _cx_streaming）与直查分支
 * （code-diff 三键，superRefine 保完整帧必含其一）。
 * terminal 不做骨架：stdout/stderr 可选无可靠标记，「命令已出、输出待传」
 * 是自然中间态。
 */
const mountWith = (key: string, data: Record<string, unknown>) => {
  const comp = CxVtu.find((x: any) => x._cx_meta.key === key)!
  return mount(comp, {
    props: { comp: { id: `test-${key}`, key, data: {}, components: {} }, ...data },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })
}

const SKELETON = '[data-testid="cx-vtu-stream-skeleton"]'

describe('社媒三件：post 标记驱动骨架', () => {
  const SOCIAL = [
    ['cx-vtu-x-post', '.cx-vtu-x-post[data-slot="x-post"]'],
    ['cx-vtu-instagram-post', '[data-slot="instagram-post"]'],
    ['cx-vtu-linkedin-post', '[data-slot="linkedin-post"]'],
  ] as const

  it.each(SOCIAL)('%s：空壳帧渲染骨架且物料缺席', (key, materialSlot) => {
    const wrapper = mountWith(key, {
      post: { author: { name: '', handle: '', avatarUrl: '' } },
      _cx_streaming: ['post'],
    })
    expect(wrapper.find(SKELETON).exists()).toBe(true)
    expect(wrapper.find(materialSlot).exists()).toBe(false)
  })

  it.each(SOCIAL)('%s：post 部分对象到达后骨架消失、物料直渲', (key, materialSlot) => {
    const wrapper = mountWith(key, {
      post: { author: { name: '张三', handle: 'zhangsan', avatarUrl: 'https://x/a.png' } },
    })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.find(materialSlot).exists()).toBe(true)
  })

  it('标记移除后骨架一次性替换为物料（无中间闪烁帧）', async () => {
    const wrapper = mountWith('cx-vtu-x-post', {
      post: { author: { name: '', handle: '', avatarUrl: '' } },
      _cx_streaming: ['post'],
    })
    expect(wrapper.find(SKELETON).exists()).toBe(true)

    await wrapper.setProps({
      post: { author: { name: '张三', handle: 'z', avatarUrl: '' }, text: '正文' },
      _cx_streaming: undefined,
    })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.html()).toContain('张三')
  })
})

describe('code-block：code 标记驱动骨架', () => {
  it('空壳帧渲染骨架', () => {
    const wrapper = mountWith('cx-vtu-code-block', { code: '', _cx_streaming: ['code'] })
    expect(wrapper.find(SKELETON).exists()).toBe(true)
    expect(wrapper.find('[data-slot="code-block"]').exists()).toBe(false)
  })

  it('中间帧（language 已闭合、code 未闭合）骨架仍在', () => {
    const wrapper = mountWith('cx-vtu-code-block', {
      code: '',
      language: 'python',
      _cx_streaming: ['code'],
    })
    expect(wrapper.find(SKELETON).exists()).toBe(true)
  })

  it('code 闭合后骨架消失、代码块渲染', () => {
    const wrapper = mountWith('cx-vtu-code-block', { code: 'const n = 42', language: 'typescript' })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.find('[data-slot="code-block"]').exists()).toBe(true)
  })
})

describe('code-diff：三键直查驱动骨架（声明层无 skeletonFields）', () => {
  it('空壳帧（三键全缺席）渲染骨架', () => {
    const wrapper = mountWith('cx-vtu-code-diff', {})
    expect(wrapper.find(SKELETON).exists()).toBe(true)
    expect(wrapper.find('[data-slot="code-diff"]').exists()).toBe(false)
  })

  it('patch 到达即揭物料（骨架覆盖至首个内容键闭合）', () => {
    const wrapper = mountWith('cx-vtu-code-diff', { patch: '@@ -1 +1 @@\n-old\n+new' })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.find('[data-slot="code-diff"]').exists()).toBe(true)
  })

  it('oldCode 单独到达即揭物料（双模式另一支）', () => {
    const wrapper = mountWith('cx-vtu-code-diff', { oldCode: 'const x = 1' })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.find('[data-slot="code-diff"]').exists()).toBe(true)
  })
})

describe('message-draft：body 标记驱动骨架', () => {
  it('空壳帧渲染骨架', () => {
    const wrapper = mountWith('cx-vtu-message-draft', {
      channel: 'email',
      subject: '',
      to: [],
      body: '',
      target: { type: 'channel', name: '' },
      _cx_streaming: ['body'],
    })
    expect(wrapper.find(SKELETON).exists()).toBe(true)
    expect(wrapper.find('[data-slot="message-draft"]').exists()).toBe(false)
  })

  it('body 闭合后骨架消失、草稿渲染', () => {
    const wrapper = mountWith('cx-vtu-message-draft', {
      channel: 'email',
      subject: '同步',
      to: ['team@example.com'],
      body: '正文',
    })
    expect(wrapper.find(SKELETON).exists()).toBe(false)
    expect(wrapper.find('[data-slot="message-draft"]').exists()).toBe(true)
  })
})

describe('骨架组件本体', () => {
  it('默认 3 行、行宽递减错落', () => {
    const wrapper = mountWith('cx-vtu-code-block', { code: '', _cx_streaming: ['code'] })
    const lines = wrapper.findAll(`${SKELETON} > div`)
    expect(lines).toHaveLength(3)
    expect(lines.map((l) => l.attributes('style'))).toEqual([
      'width: 100%;',
      'width: 86%;',
      'width: 62%;',
    ])
  })

  it('骨架对辅助技术隐藏（aria-hidden）', () => {
    const wrapper = mountWith('cx-vtu-code-block', { code: '', _cx_streaming: ['code'] })
    expect(wrapper.find(SKELETON).attributes('aria-hidden')).toBe('true')
  })
})
