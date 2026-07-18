import type { CxComponentRuntime, CxLoaderInstance } from '../../../index'
import type { AnyFn } from '@vueuse/core'
import type { Component } from 'vue'
import type { DeepPartial } from '../../helper'

export type CxComponentMetaProps = Record<string, ConfigPropMatch>
export type CxComponentMetaProp = CxComponentMetaProps[keyof CxComponentMetaProps]
export type CxComponentMetaPropSelect = {
  icon: IconProp
  'card-selector': CardSelectorProp
  json: JSONProp
  string: StringProp
  textarea: TextareaProp
  richtext: RichtextProp
  select: SelectorProp
  number: NumberProp
  range: NumberProp
  switch: SwitchProp
  color: ColorProp
  'color-simple': ColorSimpleProp
  upload: UploadProp
  custom: CustomProp
  formily: FormilyProp
  code: CodeProp
  'button-group': ButtonGroupProp
}

type ConfigPropMatch = CxPropBase &
  (
    | IconProp
    | JSONProp
    | StringProp
    | TextareaProp
    | RichtextProp
    | SelectorProp
    | CardSelectorProp
    | NumberProp
    | SwitchProp
    | ColorProp
    | ColorSimpleProp
    | UploadProp
    | CustomProp
    | FormilyProp
    | CodeProp
    | ButtonGroupProp
  )

export type CxPropCTX = Partial<{
  cmpt: Readonly<CxComponentRuntime>
  props: Readonly<Record<string, any>>
  data: Readonly<Record<string, any>>
  emits?: Readonly<AnyFn>
  cx?: Readonly<CxLoaderInstance>
}>
// 根据 CX 环境生成某些值
export type CxGen<T> = ((ctx: CxPropCTX) => T) | T

type InitialFn = (ctx: Partial<CxPropCTX>) => any
type Initial = InitialFn | string | number | boolean

export type CxPropBase = {
  // 属性类型
  type: string
  // 属性在组件中独一无二的标志
  key?: string
  // 属性展示名称
  name: string
  // 提示信息
  help?: CxGen<string>
  // 属性图标（目前在编辑面板中可能会被展示）
  icon?: string
  /**
   * 属性默认值
   * @deprecated use initial instead
   */
  default?: Initial
  // 属性默认值
  initial?: Initial
  // 隐藏条件
  hidden?: boolean | ((ctx: CxPropCTX) => boolean)
  // 只读条件
  readonly?: boolean | ((ctx: CxPropCTX) => boolean)
  // 禁用条件
  disabled?: boolean | ((ctx: CxPropCTX) => boolean)
  // 新的组件可以使用 formily 配置编辑面板
  isFormily?: boolean
  // 值改变时产生的副作用（以后会使用钩子函数重构）
  effect?: (
    newValue: any,
    oldValue: any,
    ctx: Required<CxPropCTX> & {
      cmpt: CxComponentRuntime
    },
  ) => void
}

/* ---------------------------------- prop icon ---------------------------------- */

type IconProp = {
  type: 'icon'
}

/* ---------------------------------- prop json ---------------------------------- */

type JSONProp = {
  type: 'json'
}

/* ------------------------------- prop string ------------------------------ */

type StringProp = {
  type: 'string' | 'text' | 'short'
}

/* ------------------------------- prop textarea ------------------------------ */

type TextareaProp = {
  type: 'textarea'
}

/* -------------------------------- prop rich ------------------------------- */

type RichtextProp = {
  type: 'richtext' | 'html'
}

/* ------------------------------- prop number ------------------------------ */

type NumberProp = {
  type: 'number' | 'num' | 'range'
  min?: number | ((ctx: CxPropCTX) => number)
  max?: number | ((ctx: CxPropCTX) => number)
  step?: number | ((ctx: CxPropCTX) => number)
}

/* ------------------------------- prop switch ------------------------------ */

type SwitchProp = {
  type: 'switch' | 'boolean'
}

/* ------------------------------ prop selector ----------------------------- */

export type CxSelectorPropOption = {
  label: string
  value: string
}

type SelectorProp = {
  type: 'select' | 'options'
  options: CxGen<CxSelectorPropOption[]>
  multiple?: boolean
}

/* ------------------------------- prop color ------------------------------- */

type ColorProp = {
  type: 'color' | 'string-color'
}
type ColorSimpleProp = {
  type: 'color-simple' | 'simple-color'
}

/* ------------------------------- prop custom ------------------------------ */

export type CustomProp = {
  type: 'custom'
  component?: Component
}

/* ------------------------------- prop Formily ------------------------------- */

type FormilyProp = Record<string, any> & {
  isFormily: true
  type: string
  properties: Omit<Record<string, any>, 'component'>
}

/* --------------------------- prop card-selector --------------------------- */

export type CxCardSelectorPropOption<OptionValue extends string | number = string> = {
  label: string
  description?: string
  value: OptionValue
  image?: string
  confirm?: boolean
  confirmTitle?: string
}

// 卡片选择器
type CardSelectorProp = {
  type: 'card-selector'
  isPreview?: boolean
  pickData?: (ctx: CxPropCTX) => Record<string, any>
  pickComponent?: (ctx: CxPropCTX) => Record<string, CxComponentRuntime>
  options?: CxCardSelectorPropOption[]
  ui?: DeepPartial<{
    wrapper?: string
    item?: string
    footer?: string
  }>
}

/* ------------------------------ prop image-upload ----------------------------- */

type UploadProp = ImageUploadProp

type ImageUploadPropFieldConfig = 'image' | 'fit' | 'description' | 'color'
type ImageUploadPropFieldConfigs = ImageUploadPropFieldConfig | ImageUploadPropFieldConfig[]

type ImageUploadProp = {
  type: 'image-upload'
  options?: Partial<{
    initial?: Initial
    subTitle?: boolean
    // default: '16:9'
    ratio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16'
    // default: ['upload', 'fit', 'description']
    fields?: ImageUploadPropFieldConfigs
    // default: ''
    description?: string
    // default: 1024(kb)
    maxSize?: number
  }>
}

export type CxImageUploadPropValue = {
  url?: string
  fit?: 'fit' | 'cover' | 'fill' | 'scale-down' | 'none'
  color?: string
}

/* -------------------------------- prop code ------------------------------- */

type CodePropLangs = 'css' | 'html' | 'javascript' | 'typescript' | 'json'

export type CxCodePropOptions = {
  language?: CodePropLangs
  disabledLangChange?: boolean
}

type CodeProp = {
  type: 'code'
  options?: Partial<CxCodePropOptions>
}

/* ----------------------------- prop button-group ---------------------------- */

export type CxButtonGroupOption = {
  label: string
  value: string
  icon?: string
}

type ButtonGroupProp = {
  type: 'button-group'
  options: CxButtonGroupOption[]
}
