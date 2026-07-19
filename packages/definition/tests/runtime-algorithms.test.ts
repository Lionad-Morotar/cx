import { describe, expect, it } from 'vitest'

import { createCxDatas, createCxUtils, isSlottedCxComponentGroup, touch } from '../src/index'

import type { CxComponentRuntime, CxLoaderInstance } from '../src/index'

/**
 * 核心算法表征测试：cloneComponent（经 createCxRuntimeUtils）与 makeTree（经 createCxDatas）。
 * stub 策略：cx 实例只提供算法真实依赖的最小面；reInitComponentDeep 以直通桩
 * 隔离 id 再生成逻辑，使断言聚焦装配/排序语义。
 */

const stubMetadataUtils = () => ({
  getData: (_key: string, data: Record<string, any>) => ({ ...data }),
  getKey: (key: string) => key,
  getName: (key: string) => `名称-${key}`,
  getProps: () => ({}),
  getEmits: () => ({}),
  getExposes: () => ({}),
  getSlots: () => [],
})

const stubCx = () => {
  const utils = {
    touch,
    isSlottedCxComponentGroup,
    reInitComponentDeep: (x: any) => x,
  }
  return { utils } as unknown as CxLoaderInstance
}

describe('cloneComponent（经 createCxRuntimeUtils 暴露面）', () => {
  const makeRuntimeUtils = () => {
    const cx = stubCx()
    return createCxUtils(cx)
  }

  const source = () => {
    const utils = makeRuntimeUtils()
    const child = utils.createComponent({ key: 'cx-text' }, { content: '子' })
    const root = utils.createComponent({ key: 'cx-block' }, { theme: 'dark' })
    root.components = { default: [child] }
    child.parents = [root.id]
    return { utils, root, child }
  }

  it('克隆体 id 不同于源，结构键保持一致', () => {
    const { utils, root } = source()
    const cloned = utils.cloneComponent(root)

    expect(cloned.id).not.toBe(root.id)
    expect(cloned.key).toBe(root.key)
    expect(cloned.name).toBe(root.name)
  })

  it('data 深拷贝：改克隆体不影响源', () => {
    const { utils, root } = source()
    const cloned = utils.cloneComponent(root)

    cloned.data.theme = 'light'
    expect(root.data.theme).toBe('dark')
  })

  it('components 逐槽递归克隆（preserve 含 components）', () => {
    const { utils, root, child } = source()
    const cloned = utils.cloneComponent(root, ['data', 'components'])

    const clonedChildren = (cloned.components as any).default
    expect(clonedChildren).toHaveLength(1)
    expect(clonedChildren[0].id).not.toBe(child.id)
    expect(clonedChildren[0].data.content).toBe('子')
  })

  it('preserve 限定为 data 时不保留 parents/sortn', () => {
    const { utils, root } = source()
    root.sortn = '42'
    const cloned = utils.cloneComponent(root, ['data'])

    expect(cloned.data.theme).toBe('dark')
    expect(cloned.sortn).toBe('0')
  })

  it('exclude components 时子树被剥除', () => {
    const { utils, root } = source()
    const cloned = utils.cloneComponent(root, ['data'], ['components'])

    expect(cloned.components).toBeUndefined()
  })
})

describe('makeTree（经 createCxDatas.makeCxTree）', () => {
  const stored = (
    id: string,
    opts: { sortnStr?: string; parent?: string; slot?: string } = {},
  ) => ({
    id,
    key: 'cx-text',
    sortnStr: opts.sortnStr,
    parent: opts.parent ? { id: opts.parent } : null,
    slot: opts.slot,
  })

  it('空列表短路', () => {
    const datas = createCxDatas(stubCx())
    expect(datas.makeCxTree([]).value).toEqual([])
  })

  it('乱序输入按 sortn 稳定排序（BigNumber 语义）', () => {
    const datas = createCxDatas(stubCx())
    const tree = datas.makeCxTree([
      stored('c', { sortnStr: '30' }),
      stored('a', { sortnStr: '9' }),
      stored('b', { sortnStr: '10' }),
    ] as any)

    expect(tree.value.map((x: any) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('父子装配：按 parent.id 挂入父组件对应 slot', () => {
    const datas = createCxDatas(stubCx())
    const tree = datas.makeCxTree([
      stored('root'),
      stored('child-1', { parent: 'root' }),
      stored('child-2', { parent: 'root', slot: 'side' }),
    ] as any)

    expect(tree.value).toHaveLength(1)
    const root = tree.value[0] as CxComponentRuntime
    expect(root.components!.default.map((x) => x.id)).toEqual(['child-1'])
    expect(root.components!.side.map((x) => x.id)).toEqual(['child-2'])
  })

  it('同 slot 内按 sortn 插入定位', () => {
    const datas = createCxDatas(stubCx())
    const tree = datas.makeCxTree([
      stored('root'),
      stored('a', { parent: 'root', sortnStr: '20' }),
      stored('b', { parent: 'root', sortnStr: '10' }),
      stored('c', { parent: 'root', sortnStr: '15' }),
    ] as any)

    const children = (tree.value[0] as CxComponentRuntime).components!.default
    expect(children.map((x) => x.id)).toEqual(['b', 'c', 'a'])
  })

  it('孤儿组件兜底挂到根的首个 slot', () => {
    const datas = createCxDatas(stubCx())
    const tree = datas.makeCxTree([
      stored('root'),
      stored('child', { parent: 'root' }),
      stored('orphan', { parent: 'ghost' }),
    ] as any)

    const root = tree.value[0] as CxComponentRuntime
    const allChildren = Object.values(root.components!)
      .flat()
      .map((x) => x.id)
    expect(allChildren).toContain('orphan')
  })
})
