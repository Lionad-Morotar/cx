import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { CxVtu } from '../src/index'
import { createVtuTriggerRegistry, VTU_STREAM_TRIGGERS } from '../src/stream-triggers'

import type { CxSpec } from '@lionad/cx-stream'

/**
 * article 流式切片：标量主体形态声明、注册接线与包装层骨架消化。
 * v-cx 指令由宿主编辑器安装，测试中注册 no-op 版避免警告；
 * comp 为 cx 运行时节点桩（渲染器实际注入含 id/key/data 的对象）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountArticle = (props: Record<string, any> = {}) => {
  const comp = CxVtu.find((x: any) => x._cx_meta.key === 'cx-vtu-article')!
  return mount(comp, {
    props: { comp: fakeComp('cx-vtu-article'), ...props },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })
}

describe('article 标量主体形态声明', () => {
  it('声明收录于 VTU_STREAM_TRIGGERS，key 取自物料 meta 原值', () => {
    const config = VTU_STREAM_TRIGGERS.find((c) => c.key === 'cx-vtu-article')
    expect(config).toBeDefined()
    expect(config!.sections).toHaveLength(1)
    expect(config!.sections[0]).toMatchObject({
      kind: 'scalar',
      fallbackData: { type: 'md', content: '' },
      skeletonFields: ['content'],
    })
    expect(config!.frameStride).toBe(10)
  })

  it('注册表编译产物带闭合事件标记与节流参数', () => {
    const registry = createVtuTriggerRegistry()
    const trigger = registry.get('cx-vtu-article')
    expect(trigger?.usesClosureEvents).toBe(true)
    expect(trigger?.frameStride).toBe(10)
    expect(trigger?.scanPaths).toEqual([])
  })

  it('经 vtu 真实注册表端到端：key 检出即空壳帧，正文骨架标记注入', () => {
    const registry = createVtuTriggerRegistry()
    const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })

    const shell = extractor.next('{"key":"cx-vtu-article"')
    expect(shell).toMatchObject({
      key: 'cx-vtu-article',
      data: { type: 'md', content: '', _cx_streaming: ['content'] },
    })
  })
})

describe('article 包装层骨架消化', () => {
  it('_cx_streaming 含 content 时根类带 is-streaming', () => {
    const wrapper = mountArticle({
      type: 'md',
      content: '',
      _cx_streaming: ['content'],
    })
    expect(wrapper.find('[data-testid="cx-vtu-article"]').classes()).toContain('is-streaming')
  })

  it('无标记时根类不带 is-streaming', () => {
    const wrapper = mountArticle({ type: 'md', content: '## 标题\n正文' })
    expect(wrapper.find('[data-testid="cx-vtu-article"]').classes()).not.toContain('is-streaming')
  })

  it('标记移除后 is-streaming 同步消失（骨架一次性替换为完整内容）', async () => {
    const wrapper = mountArticle({
      type: 'md',
      content: '',
      _cx_streaming: ['content'],
    })
    expect(wrapper.find('[data-testid="cx-vtu-article"]').classes()).toContain('is-streaming')

    await wrapper.setProps({ content: '## 标题\n正文', _cx_streaming: undefined })
    expect(wrapper.find('[data-testid="cx-vtu-article"]').classes()).not.toContain('is-streaming')
  })

  it('_cx_streaming 不透传物料（下划线前缀键被 useVtuProps 剥离）', () => {
    const wrapper = mountArticle({
      type: 'md',
      content: '',
      _cx_streaming: ['content'],
    })
    // 物料内部任何元素都不应携带该属性（剥离失败会落到 DOM attr 上）
    expect(wrapper.html()).not.toContain('_cx_streaming')
  })
})
