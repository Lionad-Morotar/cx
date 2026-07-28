import { describe, expect, it } from 'vitest'

import { define, defineCxComponent, toJSON } from '../src/index'

import type { Component } from 'vue'

/** 最小 Vue 组件桩：defineCxComponent 只读写属性，不要求真实渲染 */
const stubComp = { render: () => null } as unknown as Component

describe('defineCxComponent', () => {
  it('define 是同一函数的短名 alias', () => {
    expect(define).toBe(defineCxComponent)
  })

  it('key 转 PascalCase 作为组件 name', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
    }) as any

    expect(comp.name).toBe('CxText')
    expect(comp.key).toBe('cx-text')
  })

  it('挂载 _cx_meta 并填充默认值', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
      props: {
        content: { name: '文本内容', type: 'short' },
      },
    }) as any

    const meta = comp._cx_meta
    expect(meta).toBeTruthy()
    expect(meta.headless).toBe(false)
    expect(meta.async).toBe(false)
    expect(meta.emits).toEqual({})
    expect(meta.exposes).toEqual({})
    // cleanProps：prop 未声明 key 时补键名
    expect(meta.props.content.key).toBe('content')
  })

  it('显式声明的 headless 保留', () => {
    const comp = defineCxComponent({
      name: '逻辑',
      icon: 'i-tabler-box',
      description: '逻辑组件',
      key: 'cx-logic',
      headless: true,
      component: stubComp,
    }) as any

    expect(comp._cx_meta.headless).toBe(true)
  })

  it('_cx_install 以 kebab-case 名注册组件', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
    }) as any

    const registered: [string, any][] = []
    const app = { component: (k: string, c: any) => registered.push([k, c]) }
    comp._cx_install(app)

    expect(registered).toHaveLength(1)
    expect(registered[0]![0]).toBe('cx-text')
  })
})

describe('toJSON', () => {
  it('剥离 component 并生成默认 type/url/exports', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
    }) as any

    const json = toJSON(comp._cx_meta) as any
    expect(json.component).toBeUndefined()
    expect(json.type).toBe('umd')
    expect(json.url).toBe('text.js')
    expect(json.exports).toBe('CxText')
  })

  it('props 中的函数 default/initial 被剥离', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
      props: {
        content: {
          name: '文本内容',
          type: 'short',
          default: () => '动态默认值',
          initial: () => '动态初始值',
        },
      },
    }) as any

    const json = toJSON(comp._cx_meta) as any
    expect(json.props.content.default).toBeUndefined()
    expect(json.props.content.initial).toBeUndefined()
  })

  it('props.options 嵌套的函数 default/initial 同样被剥离', () => {
    const comp = defineCxComponent({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubComp,
      props: {
        content: {
          name: '文本内容',
          type: 'select',
          options: {
            default: () => '嵌套默认值',
            initial: () => '嵌套初始值',
          },
        },
      },
    }) as any

    const json = toJSON(comp._cx_meta) as any
    expect(json.props.content.options.default).toBeUndefined()
    expect(json.props.content.options.initial).toBeUndefined()
    // 产物必须可 JSON 序列化
    expect(() => JSON.stringify(json)).not.toThrow()
  })
})
