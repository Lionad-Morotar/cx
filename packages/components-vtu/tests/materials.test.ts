import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxVtu, CxVtuBundle } from '../src/index'

/**
 * vtu 物料 smoke：normalize 契约（_cx_meta + _cx_install + key 唯一）+ 代表性挂载。
 * v-cx 指令由宿主编辑器安装，测试中注册 no-op 版避免警告。
 * cmpt 为 cx 运行时节点桩：渲染器实际注入含 id/key/data 的对象，包装层据此回退 vtu 必填 id。
 */
const fakeCmpt = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (cmpt: any, props: Record<string, any> = {}) =>
  mount(cmpt, {
    props: { cmpt: fakeCmpt(cmpt._cx_meta?.key || 'x'), ...props },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })

const byKey = (key: string) => CxVtu.find((x: any) => x._cx_meta.key === key)!

describe('vtu 物料契约', () => {
  it('覆盖 vtu 全部 29 个工具组件', () => {
    expect(CxVtu).toHaveLength(29)
  })

  it('bundle 自描述：name 为 vtu，materials 与 CxVtu 一致', () => {
    expect(CxVtuBundle.name).toBe('vtu')
    expect(CxVtuBundle.materials).toHaveLength(CxVtu.length)
  })

  it('每个物料带 _cx_meta + _cx_install，key 唯一且匹配 cx-vtu- 前缀', () => {
    const keys = new Set<string>()
    for (const m of CxVtu as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
      expect(m._cx_meta.key).toMatch(/^cx-vtu-[a-z0-9-]+$/)
      keys.add(m._cx_meta.key)
    }
    expect(keys.size).toBe(CxVtu.length)
  })
})

describe('vtu 物料挂载 smoke', () => {
  it('cx-vtu-terminal 渲染命令文本', () => {
    const cmpt = byKey('cx-vtu-terminal')
    const wrapper = mountMaterial(cmpt, {
      command: 'pnpm install',
      exitCode: 0,
      stdout: 'added 42 packages in 2s',
    })
    expect(wrapper.text()).toContain('pnpm install')
  })

  it('cx-vtu-terminal 从 cmpt.id 回退 vtu 必填 id', () => {
    const cmpt = byKey('cx-vtu-terminal')
    const wrapper = mountMaterial(cmpt, { command: 'ls', exitCode: 0 })
    expect(wrapper.html()).toContain('test-cx-vtu-terminal')
  })

  it('cx-vtu-code-block 可挂载（标量 props）', () => {
    const cmpt = byKey('cx-vtu-code-block')
    const wrapper = mountMaterial(cmpt, { code: 'const a = 1', language: 'typescript' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-article 可挂载（md 内容）', () => {
    const cmpt = byKey('cx-vtu-article')
    const wrapper = mountMaterial(cmpt, { type: 'md', content: '## 标题\n正文', title: '示例' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-stats-display 可挂载（统计项）', () => {
    const cmpt = byKey('cx-vtu-stats-display')
    const wrapper = mountMaterial(cmpt, {
      stats: [{ key: 'a', label: '指标', value: 42 }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-data-table 可挂载（列 + 行）', () => {
    const cmpt = byKey('cx-vtu-data-table')
    const wrapper = mountMaterial(cmpt, {
      columns: [{ key: 'name', label: '名称' }],
      data: [{ name: 'Alice' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-image 可挂载（标量 props）', () => {
    const cmpt = byKey('cx-vtu-image')
    const wrapper = mountMaterial(cmpt, {
      assetId: 'image-1',
      src: 'https://picsum.photos/seed/cx/640/360',
      alt: '示例',
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-audio 可挂载（标量 props）', () => {
    const cmpt = byKey('cx-vtu-audio')
    const wrapper = mountMaterial(cmpt, {
      assetId: 'audio-1',
      src: 'https://example.com/audio/demo.mp3',
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-contact-card 可挂载（kind + value）', () => {
    const cmpt = byKey('cx-vtu-contact-card')
    const wrapper = mountMaterial(cmpt, { kind: 'email', value: 'hi@example.com' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-citation 可挂载（href + title）', () => {
    const cmpt = byKey('cx-vtu-citation')
    const wrapper = mountMaterial(cmpt, { href: 'https://example.com', title: '来源' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-link-preview 可挂载（href）', () => {
    const cmpt = byKey('cx-vtu-link-preview')
    const wrapper = mountMaterial(cmpt, { href: 'https://example.com/page' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-approval-card 可挂载（title）', () => {
    const cmpt = byKey('cx-vtu-approval-card')
    const wrapper = mountMaterial(cmpt, { title: '确认操作？' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-plan 可挂载（todos）', () => {
    const cmpt = byKey('cx-vtu-plan')
    const wrapper = mountMaterial(cmpt, {
      title: '计划',
      todos: [{ id: 't1', label: '步骤', status: 'pending' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-progress-tracker 可挂载（steps）', () => {
    const cmpt = byKey('cx-vtu-progress-tracker')
    const wrapper = mountMaterial(cmpt, {
      steps: [{ id: 's1', label: '解析', status: 'completed' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-option-list 可挂载（options）', () => {
    const cmpt = byKey('cx-vtu-option-list')
    const wrapper = mountMaterial(cmpt, {
      options: [{ id: 'o1', label: '选项一' }],
    })
    expect(wrapper.exists()).toBe(true)
  })
})
