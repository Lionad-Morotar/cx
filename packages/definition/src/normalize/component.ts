import kebabCase from 'lodash-es/kebabCase'
import upperFirst from 'lodash-es/upperFirst'
import camelCase from 'lodash-es/camelCase'
import { prefix } from '../helper'
import { withDefaultMeta } from './meta'

import { markRaw } from 'vue'
import type { App, Component } from 'vue'
import type {
  CxComponentRuntime,
  ComponentProps,
  CxComponentMetaEmits,
  CxComponentMetaExposes,
  CxComponentMetaProps,
  CxComponentMetaSlots,
  Get,
  IsEqual,
  IsEveryTrueThen,
  IsKebabCase,
  IsNotEqual,
  KeyofComponentEmits,
  NormalizeKey,
  CxLoaderInstance,
} from '../types'

/**
 * normalizeCxComponent
 * 生成标准化组件，
 * 相比普通的 Vue 组件挂载了自定义组件元信息、安装函数等属性
 * TODO FIXME 推断 exposes.event.args
 * TODO 推断 exposes slots
 * TODO 类似 defineOptions 之类的语法也许可以使 normalize 更加简化
 */
export const normalize = <
  VueCmpt extends Component,
  CnName extends string,
  VKey extends string,
  M extends {
    // 组件名
    name: CnName
    getName?: (opts: {
      cx: CxLoaderInstance
      cmpt: CxComponentRuntime
      data?: Record<string, any>
    }) => string
    // example: 'i-ant-design-layout-outlined'
    icon: string
    // 组件描述
    description: string
    // 组件独一无二标志
    key: VKey
    // 组件别名，用于注册组件
    aliasKeys?: string | string[]
    // Vue 组件
    component: VueCmpt
    // 组件是否有真实 DOM 结构
    headless?: boolean
    // 标记为异步组件
    async?: boolean
    props?: CxComponentMetaProps
    emits?: CxComponentMetaEmits
    exposes?: CxComponentMetaExposes
    slots?: CxComponentMetaSlots
    url?: string
    umdExportsName?: string
    // 组件包类型，local 是本地组件，比如使用 cx 方自行实现的组件
    type?: 'umd' | 'esm' | 'local'
    // 组件规则（指导实现组件搭建的使用方遵循此类规则）
    // 之后可能会作为 cx 和业务层（p-ray setup）之间的一层分层规则
    rules?: {
      edit: {}
    }
  },
  GM extends Partial<Guard<M>>,
>(
  m: GM,
) => {
  const component = m.component as VueCmpt & NormalizeKey<Required<M>>
  // @ts-ignore
  const meta = withDefaultMeta(m)
  // console.log('[debug] meta', meta)

  component.name = upperFirst(camelCase(meta.key))
  component.key = kebabCase(component.name)

  // @ts-ignore
  component[prefix('meta')] = meta

  component[prefix('install')] = (app: App) => {
    const name = component.name
    const key = kebabCase(name)
    app.component(key, markRaw(component))
  }

  return component
}

// 类型守卫并不提供类型推断能力，
// 推断能力依靠 normalize 接口的泛型约束（即 extends）
type Guard<M> = IsEveryTrueThen<
  [
    // 名称不应为空字符串
    IsNotEqual<Get<M, 'name'>, ''>,

    // key 应为 kebabCase 格式字符串
    IsKebabCase<Get<M, 'key'>>,

    // components 应为 Vue 组件
    Get<M, 'component'> extends Component ? true : false,

    // props 键名是 Vue 组件 props
    Get<M, 'props'> extends never
      ? true
      : Exclude<keyof Get<M, 'props'>, keyof ComponentProps<Get<M, 'component'>>> extends never
        ? true
        : false,

    // emits 键名是 Vue 组件 emits
    Get<M, 'emits'> extends never
      ? true
      : Exclude<keyof Get<M, 'emits'>, KeyofComponentEmits<Get<M, 'component'>>> extends never
        ? true
        : false,

    // exposes 的键名是 Vue 组件暴露的函数
    Get<M, 'exposes'> extends never
      ? true
      : IsEqual<
            keyof { [K in keyof Get<M, 'exposes'>]: any },
            keyof {
              [K in keyof Get<M, 'exposes'> as K extends keyof InstanceType<Get<M, 'component'>>
                ? Get<InstanceType<Get<M, 'component'>>, K> extends (...args: any[]) => any
                  ? K
                  : never
                : never]: any
            }
          > extends true
        ? true
        : false,
  ],
  M
>

export const toRuntime = 'todo'
