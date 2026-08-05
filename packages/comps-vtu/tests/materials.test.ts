import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxVtu, CxVtuBundle } from '../src/index'

/**
 * vtu 物料 smoke：defineCxComponent 契约（_cx_meta + _cx_install + key 唯一）+ 代表性挂载。
 * v-cx 指令由宿主编辑器安装，测试中注册 no-op 版避免警告。
 * comp 为 cx 运行时节点桩：渲染器实际注入含 id/key/data 的对象，包装层据此回退 vtu 必填 id。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
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
    const comp = byKey('cx-vtu-terminal')
    const wrapper = mountMaterial(comp, {
      command: 'pnpm install',
      exitCode: 0,
      stdout: 'added 42 packages in 2s',
    })
    expect(wrapper.text()).toContain('pnpm install')
  })

  it('cx-vtu-terminal 从 comp.id 回退 vtu 必填 id', () => {
    const comp = byKey('cx-vtu-terminal')
    const wrapper = mountMaterial(comp, { command: 'ls', exitCode: 0 })
    expect(wrapper.html()).toContain('test-cx-vtu-terminal')
  })

  it('cx-vtu-code-block 可挂载（标量 props）', () => {
    const comp = byKey('cx-vtu-code-block')
    const wrapper = mountMaterial(comp, { code: 'const a = 1', language: 'typescript' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-article 可挂载（md 内容）', () => {
    const comp = byKey('cx-vtu-article')
    const wrapper = mountMaterial(comp, { type: 'md', content: '## 标题\n正文', title: '示例' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-stats-display 可挂载（统计项）', () => {
    const comp = byKey('cx-vtu-stats-display')
    const wrapper = mountMaterial(comp, {
      stats: [{ key: 'a', label: '指标', value: 42 }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-data-table 可挂载（列 + 行）', () => {
    const comp = byKey('cx-vtu-data-table')
    const wrapper = mountMaterial(comp, {
      columns: [{ key: 'name', label: '名称' }],
      data: [{ name: 'Alice' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-image 可挂载（标量 props）', () => {
    const comp = byKey('cx-vtu-image')
    const wrapper = mountMaterial(comp, {
      assetId: 'image-1',
      src: 'https://picsum.photos/seed/cx/640/360',
      alt: '示例',
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-audio 可挂载（标量 props）', () => {
    const comp = byKey('cx-vtu-audio')
    const wrapper = mountMaterial(comp, {
      assetId: 'audio-1',
      src: 'https://example.com/audio/demo.mp3',
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-contact-card 可挂载（kind + value）', () => {
    const comp = byKey('cx-vtu-contact-card')
    const wrapper = mountMaterial(comp, { kind: 'email', value: 'hi@example.com' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-citation 可挂载（href + title）', () => {
    const comp = byKey('cx-vtu-citation')
    const wrapper = mountMaterial(comp, { href: 'https://example.com', title: '来源' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-link-preview 可挂载（href）', () => {
    const comp = byKey('cx-vtu-link-preview')
    const wrapper = mountMaterial(comp, { href: 'https://example.com/page' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-approval-card 可挂载（title）', () => {
    const comp = byKey('cx-vtu-approval-card')
    const wrapper = mountMaterial(comp, { title: '确认操作？' })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-plan 可挂载（todos）', () => {
    const comp = byKey('cx-vtu-plan')
    const wrapper = mountMaterial(comp, {
      title: '计划',
      todos: [{ id: 't1', label: '步骤', status: 'pending' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-progress-tracker 可挂载（steps）', () => {
    const comp = byKey('cx-vtu-progress-tracker')
    const wrapper = mountMaterial(comp, {
      steps: [{ id: 's1', label: '解析', status: 'completed' }],
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-vtu-option-list 可挂载（options）', () => {
    const comp = byKey('cx-vtu-option-list')
    const wrapper = mountMaterial(comp, {
      options: [{ id: 'o1', label: '选项一' }],
    })
    expect(wrapper.exists()).toBe(true)
  })
})

/**
 * meta initial 与 vtu SFC 消费契约对齐：initial 值必须经 SFC 渲染出完整结构。
 * vtu 源码（tool-ui-vue schema/SFC）为唯一准绳；status 枚举等字段不可跨组件类推
 *（plan 用 in_progress 下划线、progress-tracker 用 in-progress 连字符）。
 */
describe('meta initial 与 vtu 消费契约对齐', () => {
  /** meta props 的 initial 统一求值（函数形态带空 ctx 调一次） */
  const initialOf = (key: string, prop: string) => {
    const meta = byKey(key)._cx_meta.props[prop]
    return typeof meta.initial === 'function' ? meta.initial({}) : meta.initial
  }

  it('approval-card metadata 项以 key 渲染（SFC 消费 item.key）', () => {
    const comp = byKey('cx-vtu-approval-card')
    const wrapper = mountMaterial(comp, {
      title: '确认部署？',
      metadata: initialOf('cx-vtu-approval-card', 'metadata'),
    })
    expect(wrapper.text()).toContain('环境')
    expect(wrapper.text()).toContain('production')
  })

  it('plan todos 的 in_progress 状态渲染进行态样式', () => {
    const comp = byKey('cx-vtu-plan')
    const wrapper = mountMaterial(comp, {
      title: '计划',
      todos: initialOf('cx-vtu-plan', 'todos'),
    })
    expect(wrapper.html()).toContain('shimmer')
  })

  it('progress-tracker elapsedTime 为毫秒数（渲染不出现 NaN）', () => {
    const comp = byKey('cx-vtu-progress-tracker')
    const wrapper = mountMaterial(comp, {
      elapsedTime: initialOf('cx-vtu-progress-tracker', 'elapsedTime'),
      steps: [{ id: 's1', label: '解析', status: 'completed' }],
    })
    expect(wrapper.text()).not.toContain('NaN')
  })

  it('message-draft 声明 target 且 slack 分支挂载不炸', () => {
    const comp = byKey('cx-vtu-message-draft')
    const target = initialOf('cx-vtu-message-draft', 'target')
    expect(target).toBeTruthy()
    const wrapper = mountMaterial(comp, {
      channel: 'slack',
      body: '本周迭代已完成',
      target,
    })
    expect(wrapper.text()).toContain('general')
  })
})
