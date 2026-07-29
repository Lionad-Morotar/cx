// el-plus @element-plus/hooks 最小子集（仅 el-calendar 依赖）：useNamespace + useLocale
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import zhCn from './locale'

const defaultNamespace = 'el'
const statePrefix = 'is-'

const _bem = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string,
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) cls += `-${blockSuffix}`
  if (element) cls += `__${element}`
  if (modifier) cls += `--${modifier}`
  return cls
}

export const useNamespace = (block: string) => {
  // Why: namespace 固定 'el'，cx-calendar 不依赖 ElConfigProvider 切换命名空间。
  // 这样 el-calendar / el-calendar-table / el-calendar-day 等类名与原版逐字一致，
  // 保证 cx-calendar 的 SCSS 覆盖（.el-calendar-table 等）无需任何改动。
  const namespace = defaultNamespace

  const b = (blockSuffix = '') => _bem(namespace, block, blockSuffix, '', '')
  const e = (element?: string) => (element ? _bem(namespace, block, '', element, '') : '')
  const m = (modifier?: string) => (modifier ? _bem(namespace, block, '', '', modifier) : '')
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace, block, blockSuffix, element, '') : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace, block, '', element, modifier) : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? _bem(namespace, block, blockSuffix, '', modifier) : ''
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier ? _bem(namespace, block, blockSuffix, element, modifier) : ''
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) styles[`--${namespace}-${key}`] = object[key]
    }
    return styles
  }
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) styles[`--${namespace}-${block}-${key}`] = object[key]
    }
    return styles
  }
  const cssVarName = (name: string) => `--${namespace}-${name}`
  const cssVarBlockName = (name: string) => `--${namespace}-${block}-${name}`

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName,
  }
}

export type UseNamespaceReturn = ReturnType<typeof useNamespace>

// path-based 取值 + {key} 占位符替换，对齐 el-plus translate
const translate = (
  path: string,
  option: undefined | Record<string, string | number>,
  locale: any,
): string => {
  const keys = path.split('.')
  let cur = locale
  for (const k of keys) {
    cur = cur?.[k]
    if (cur == null) break
  }
  const result = cur == null ? path : String(cur)
  return option ? result.replace(/\{(\w+)\}/g, (_, key) => `${option[key] ?? `{${key}}`}`) : result
}

export type Translator = (path: string, option?: Record<string, string | number>) => string

export type LocaleContext = {
  locale: Ref<any>
  lang: ComputedRef<string>
  t: Translator
}

// useLocale：固定 zh-cn（cx-calendar 中文场景）；lang 同时驱动 dayjs locale
export const useLocale = (): LocaleContext => {
  const locale = ref(zhCn)
  const lang = computed(() => locale.value.name)
  const t: Translator = (path, option) => translate(path, option, locale.value)
  return { locale, lang, t }
}
