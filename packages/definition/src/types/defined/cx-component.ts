import type { CxComponentSlot } from '../index'
import type { RecordToUnion } from '../helper'
import type { UnionToIntersection } from 'type-fest'
import type { AllowedComponentProps, App, Component, Plugin, VNodeProps } from 'vue'

type PluginInstallFunction = (app: App, ...options: any[]) => any

/**
 * 扩展后的 Vue 组件应该携带这些“自定义组件的标准化数据”，
 * 由于 name、key 字段和 Vue 组件通用，
 * 所以相当于在 Vue 组件的基础上扩展了安装函数和元信息等其他数据
 */
export type NormalizeKey<M> = {
  // Vue 组件名称
  name: string
  // Vue 组件 key（通常是名称的中格线格式）
  key: string
  // 安装函数
  _cx_install: PluginInstallFunction
  // 元信息
  _cx_meta: M
}

export type SFCExtended<T> = Plugin &
  T & {
    name: string
    key: string
  }

// 在 normalize 需要中补全不完整的元信息
export type CxComponentMetaDefined<VueComp extends Component = Component> = {
  name: string
  key: string
  component: VueComp
  headless?: boolean
  // 是否是异步组件
  async?: boolean
  props?: ComponentProps<VueComp>
  emits?: Record<string, any>
  exposes?: Record<string, any>
  slots?: Record<string, CxComponentSlot>
  // 组件包类型, wip npm-package\esm
  type?: 'umd' | 'esm' | 'local'
  // string
  url?: string
  // string
  umdExportsName?: string
}

/* 运行时元信息（挂在组件属性上，传输时可序列化） */
export type Meta<VueComp extends Component = Component> = Omit<
  Required<CxComponentMetaDefined<VueComp>>,
  'component'
> & {
  // 目前只有 UMD 组件，所以需要声明向外暴露的名字
  exports?: string
  type?: 'umd' | 'esm' | 'local'
  // 如 “card.js”，但这个字段考虑废弃，因为将来不仅仅只有 js 组件，改名 entry 更合适些
  url?: string
}
export type CxMeta<T extends Component = Component> = Meta<T>
export type CxMetaBase = CxMeta

/**
 * 提取 vue 组件的 props 类型
 * @see https://stackoverflow.com/questions/68602712/extracting-the-prop-types-of-a-component-in-vue-3-typescript-to-use-them-somew
 */
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never

// 推断 vue 组件的 emit 接收的事件名
export type KeyofComponentEmits<C extends Component> = C extends new (...args: any) => any
  ? InstanceType<C>['$emit'] extends (e: infer EvtKey, ...args: any[]) => void
    ? EvtKey
    : never
  : never

// @vue/compiler-sfc cannot resolved such complex type,
// @see https://github.com/vitejs/vite-plugin-vue/issues/167
// @ts-ignore
// export type ComponentEmits<T> = [/*nothing */]

// 从组件 emits 定义推断 defineEmits 的类型
export type ComponentEmits<T extends Record<string, any>> = UnionToIntersection<
  RecordToUnion<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void
  }>
>
